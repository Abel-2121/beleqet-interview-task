import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { QUEUE_NAMES, ESCROW_JOBS, NOTIFICATION_JOBS } from '../queues/queues.constants';
import {
  buildTxRef,
  formatPhoneForChapa,
  getChapaSecret,
  initializeChapaCheckout,
  parseEscrowIdFromTxRef,
  verifyChapaTransaction,
} from './chapa.util';

const PLATFORM_FEE_PCT = 0.10;

/** Service that handles escrow lifecycle: initiation, Chapa verification, funding, and milestone release */
@Injectable()
export class EscrowService {
  private readonly logger = new Logger(EscrowService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @InjectQueue(QUEUE_NAMES.ESCROW) private readonly escrowQueue: Queue,
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS) private readonly notificationsQueue: Queue,
  ) {}

  /** Initiate escrow — returns Chapa checkout URL */
  async initiate(clientId: string, freelanceJobId: string) {
    const job = await this.prisma.freelanceJob.findFirst({
      where: { id: freelanceJobId, clientId },
      include: { client: true, contract: true },
    });
    if (!job) throw new NotFoundException('Gig not found');

    const existing = await this.prisma.escrowTransaction.findUnique({
      where: { freelanceJobId },
    });
    if (existing?.status === 'FUNDED') {
      return {
        escrowId: existing.id,
        checkoutUrl: `${this.config.get('FRONTEND_URL')}/freelance/payment-success?payment=success&escrowId=${existing.id}`,
        txRef: existing.gatewayRef || undefined,
        grossAmount: existing.grossAmount,
        platformFee: existing.platformFee,
        netAmount: existing.netAmount,
      };
    }
    if (existing?.status === 'PENDING') {
      const refreshedTxRef = buildTxRef(existing.id);
      await this.prisma.escrowTransaction.update({
        where: { id: existing.id },
        data: { gatewayRef: refreshedTxRef },
      });
      const checkoutUrl = await this.createChapaCheckout(job, existing.grossAmount, refreshedTxRef, existing.id);
      return {
        escrowId: existing.id,
        checkoutUrl: checkoutUrl || `${this.config.get('FRONTEND_URL')}/freelance/payment-success?escrowId=${existing.id}`,
        txRef: refreshedTxRef,
        grossAmount: existing.grossAmount,
        platformFee: existing.platformFee,
        netAmount: existing.netAmount,
      };
    }

    const grossAmount = job.contract ? job.contract.agreedAmount : job.budgetMax;
    if (!job.contract) {
      this.logger.warn(
        `Escrow initiated without a contract for job ${freelanceJobId} — using budgetMax.`,
      );
    }

    const platformFee = Math.round(grossAmount * PLATFORM_FEE_PCT);
    const netAmount = grossAmount - platformFee;

    const escrow = await this.prisma.escrowTransaction.create({
      data: {
        freelanceJobId,
        grossAmount,
        platformFee,
        netAmount,
        status: 'PENDING',
      },
    });

    const finalTxRef = buildTxRef(escrow.id);
    await this.prisma.escrowTransaction.update({
      where: { id: escrow.id },
      data: { gatewayRef: finalTxRef },
    });

    const apiBase = this.config.get<string>('API_PUBLIC_URL') || 'http://localhost:4000/api/v1';
    const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const checkoutUrl = await this.createChapaCheckout(job, grossAmount, finalTxRef, escrow.id)
      || `${frontendUrl}/freelance/payment-success?escrowId=${escrow.id}&gigId=${freelanceJobId}`;

    this.logger.log(`Escrow initiated: ${escrow.id} — tx_ref=${finalTxRef} — ETB ${grossAmount}`);
    return { escrowId: escrow.id, checkoutUrl, txRef: finalTxRef, grossAmount, platformFee, netAmount };
  }

  /** Build and call the Chapa checkout initialization with escrow details */
  private async createChapaCheckout(
    job: { title: string; client: { email: string; firstName: string; lastName: string; phone?: string | null } },
    grossAmount: number,
    finalTxRef: string,
    escrowId: string,
  ): Promise<string | null> {
    const chapaSecret = getChapaSecret(this.config);
    if (!chapaSecret) return null;

    const apiBase = this.config.get<string>('API_PUBLIC_URL') || 'http://localhost:4000/api/v1';
    const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const phone = formatPhoneForChapa(job.client.phone);

    const init = await initializeChapaCheckout(chapaSecret, {
      amount: grossAmount.toString(),
      currency: 'ETB',
      email: job.client.email,
      first_name: job.client.firstName,
      last_name: job.client.lastName,
      ...(phone && { phone_number: phone }),
      tx_ref: finalTxRef,
      callback_url: `${apiBase}/escrow/callback`,
      return_url: `${apiBase}/escrow/return?tx_ref=${encodeURIComponent(finalTxRef)}`,
      'customization[title]': 'Beleqet Escrow',
      'customization[description]': `Payment for: ${job.title}`.slice(0, 120),
    });

    if (init.checkoutUrl) return init.checkoutUrl;
    this.logger.warn(`Chapa initialization failed: ${init.message}`);
    return `${frontendUrl}/freelance/payment-success?escrowId=${escrowId}`;
  }

  /** Verify a Chapa transaction via API and mark the corresponding escrow as funded (idempotent) */
  async verifyAndProcessPayment(txRef: string) {
    const chapaSecret = getChapaSecret(this.config);
    if (!chapaSecret) {
      return { success: false, reason: 'Chapa not configured' };
    }

    const verify = await verifyChapaTransaction(txRef, chapaSecret);
    if (!verify.ok) {
      this.logger.warn(`Chapa verify failed for ${txRef}`);
      return { success: false, reason: 'verification_failed' };
    }

    const result = await this.markEscrowFunded(txRef, verify.data);
    return {
      success: result.processed,
      alreadyProcessed: result.alreadyProcessed,
      escrowId: result.escrowId,
    };
  }

  /** Mark an escrow transaction as funded in a DB transaction, log the event, and send a notification */
  async markEscrowFunded(txRef: string, gatewayResponse: Record<string, unknown>) {
    const escrow = await this.findEscrowByTxRef(txRef);
    if (!escrow) {
      this.logger.warn(`No escrow found for tx_ref=${txRef}`);
      return { processed: false, alreadyProcessed: false, escrowId: null };
    }

    if (escrow.status === 'FUNDED') {
      return { processed: true, alreadyProcessed: true, escrowId: escrow.id };
    }

    await this.prisma.$transaction([
      this.prisma.escrowTransaction.update({
        where: { id: escrow.id },
        data: {
          status: 'FUNDED',
          fundedAt: new Date(),
          gatewayResponse: gatewayResponse as Prisma.InputJsonValue,
        },
      }),
      this.prisma.freelanceJob.update({
        where: { id: escrow.freelanceJobId },
        data: { status: 'FUNDED' },
      }),
      this.prisma.eventLog.create({
        data: {
          eventType: 'escrow.funded',
          entityId: escrow.id,
          entityType: 'EscrowTransaction',
          payload: { escrowId: escrow.id, amount: escrow.grossAmount, ref: txRef },
          processedBy: EscrowService.name,
        },
      }),
    ]);

    const job = await this.prisma.freelanceJob.findUnique({
      where: { id: escrow.freelanceJobId },
      select: { clientId: true },
    });

    if (job) {
      await this.notificationsQueue.add(NOTIFICATION_JOBS.SEND_IN_APP, {
        userId: job.clientId,
        type: 'escrow.funded',
        title: 'Escrow funded — your gig is now live!',
        body: `ETB ${escrow.grossAmount.toLocaleString()} has been secured. Freelancers can now bid on your project.`,
        metadata: { escrowId: escrow.id, freelanceJobId: escrow.freelanceJobId },
      });
    }

    this.logger.log(`Escrow ${escrow.id} funded via tx_ref=${txRef}`);
    return { processed: true, alreadyProcessed: false, escrowId: escrow.id };
  }

  /** Look up an escrow transaction by its Chapa tx_ref or embedded escrow ID */
  private async findEscrowByTxRef(txRef: string) {
    const escrowId = parseEscrowIdFromTxRef(txRef);
    return this.prisma.escrowTransaction.findFirst({
      where: {
        OR: [
          { gatewayRef: txRef },
          ...(escrowId ? [{ id: escrowId }] : []),
        ],
      },
    });
  }

  /** Queue an incoming webhook payload from Chapa for async processing */
  async handleWebhook(payload: Record<string, unknown>) {
    const txRef =
      (payload.tx_ref as string) ||
      (payload.reference as string) ||
      (payload.trx_ref as string) ||
      ((payload.data as Record<string, unknown>)?.tx_ref as string);

    if (!txRef) {
      this.logger.warn('[escrow-webhook] Missing tx_ref in payload');
      return;
    }

    await this.escrowQueue.add(ESCROW_JOBS.PROCESS_WEBHOOK, { tx_ref: txRef, ...payload });
  }

  /** Return the current status and amount details for a given escrow transaction */
  async getEscrowStatus(txRef: string) {
    const escrow = await this.findEscrowByTxRef(txRef);
    if (!escrow) throw new NotFoundException('Escrow not found');
    return {
      escrowId: escrow.id,
      status: escrow.status,
      grossAmount: escrow.grossAmount,
      fundedAt: escrow.fundedAt,
    };
  }

  /** Approve a milestone and enqueue an auto-release job after a 3-day hold period */
  async releaseMilestone(milestoneId: string, clientId: string) {
    const milestone = await this.prisma.milestone.findFirst({
      where: { id: milestoneId, contract: { clientId } },
      include: { contract: { include: { freelanceJob: { include: { escrowTx: true } } } } },
    });
    if (!milestone) throw new NotFoundException('Milestone not found');

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.milestone.update({
        where: { id: milestoneId },
        data: { status: 'APPROVED', approvedAt: new Date() },
      });

      await tx.eventLog.create({
        data: {
          eventType: 'milestone.approved',
          entityId: milestoneId,
          entityType: 'Milestone',
          payload: {
            milestoneId,
            freelancerId: milestone.contract.freelancerId,
            amount: milestone.amount,
          },
          processedBy: EscrowService.name,
        },
      });
    });

    try {
      await this.escrowQueue.add(ESCROW_JOBS.AUTO_RELEASE, {
        milestoneId,
        freelancerId: milestone.contract.freelancerId,
        amount: milestone.amount,
        releaseAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      });
    } catch (err) {
      this.logger.error(
        `Failed to enqueue auto-release for milestone ${milestoneId}`,
        err instanceof Error ? err.stack : err,
      );
    }

    this.logger.log(`Milestone ${milestoneId} approved — payout queued`);
    return { success: true };
  }
}
