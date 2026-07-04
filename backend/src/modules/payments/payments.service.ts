import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  formatPhoneForChapa,
  getChapaSecret,
  initializeChapaCheckout,
  verifyChapaTransaction,
} from '../escrow/chapa.util';

export const EMPLOYER_PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic',
    amount: 0,
    description: 'Post a single job listing',
  },
  featured: {
    id: 'featured',
    name: 'Featured',
    amount: 1500,
    description: 'Priority placement with featured badge',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    amount: 0,
    description: 'Custom hiring package',
    contactOnly: true,
  },
} as const;

export type EmployerPlanId = keyof typeof EMPLOYER_PLANS;

function buildPlanTxRef(userId: string, planId: string): string {
  const shortId = userId.replace(/-/g, '').slice(0, 8);
  return `BLQ-PLAN-${shortId}-${planId}-${Date.now()}`;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  getPlans() {
    return Object.values(EMPLOYER_PLANS);
  }

  async initiatePlanCheckout(userId: string, planId: EmployerPlanId) {
    const plan = EMPLOYER_PLANS[planId];
    if (!plan) throw new BadRequestException('Invalid plan');

    if ('contactOnly' in plan && plan.contactOnly) {
      throw new BadRequestException('Enterprise plan requires contacting sales');
    }

    if (plan.amount <= 0) {
      return {
        planId: plan.id,
        amount: 0,
        checkoutUrl: null,
        message: 'This plan is free — you can post a job directly.',
      };
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const txRef = buildPlanTxRef(userId, planId);
    const apiBase = this.config.get<string>('API_PUBLIC_URL') || 'http://localhost:4000/api/v1';
    const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const chapaSecret = getChapaSecret(this.config);

    await this.prisma.eventLog.create({
      data: {
        eventType: 'plan.checkout.initiated',
        entityId: userId,
        entityType: 'User',
        payload: { planId, amount: plan.amount, txRef },
        processedBy: PaymentsService.name,
      },
    });

    if (!chapaSecret) {
      this.logger.warn('Chapa not configured — returning mock checkout URL');
      return {
        planId: plan.id,
        amount: plan.amount,
        txRef,
        checkoutUrl: `${frontendUrl}/pricing/success?payment=pending&plan=${planId}&tx_ref=${encodeURIComponent(txRef)}`,
        message: 'Chapa is not configured on the server. Use test mode or add CHAPA_TEST_SECRET_KEY.',
      };
    }

    const phone = formatPhoneForChapa(user.phone);
    const init = await initializeChapaCheckout(chapaSecret, {
      amount: plan.amount.toString(),
      currency: 'ETB',
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      ...(phone && { phone_number: phone }),
      tx_ref: txRef,
      callback_url: `${apiBase}/payments/plans/callback`,
      return_url: `${apiBase}/payments/plans/return?tx_ref=${encodeURIComponent(txRef)}&plan=${planId}`,
      'customization[title]': 'Beleqet Jobs',
      'customization[description]': `${plan.name} employer plan`.slice(0, 120),
    });

    if (!init.checkoutUrl) {
      throw new BadRequestException(init.message || 'Could not initialize Chapa checkout');
    }

    return {
      planId: plan.id,
      amount: plan.amount,
      txRef,
      checkoutUrl: init.checkoutUrl,
    };
  }

  async verifyPlanPayment(txRef: string, planId?: string) {
    const chapaSecret = getChapaSecret(this.config);
    if (!chapaSecret) {
      return { success: false, reason: 'Chapa not configured' };
    }

    const verify = await verifyChapaTransaction(txRef, chapaSecret);
    if (!verify.ok) {
      return { success: false, reason: 'verification_failed' };
    }

    const resolvedPlan = planId || this.parsePlanFromTxRef(txRef);
    await this.prisma.eventLog.create({
      data: {
        eventType: 'plan.payment.completed',
        entityId: txRef,
        entityType: 'PlanPayment',
        payload: { txRef, planId: resolvedPlan, gateway: verify.data as Prisma.InputJsonValue },
        processedBy: PaymentsService.name,
      },
    });

    return { success: true, planId: resolvedPlan, txRef };
  }

  private parsePlanFromTxRef(txRef: string): string | null {
    const match = txRef.match(/^BLQ-PLAN-[0-9a-f]{8}-([a-z]+)-/i);
    return match?.[1] ?? null;
  }
}
