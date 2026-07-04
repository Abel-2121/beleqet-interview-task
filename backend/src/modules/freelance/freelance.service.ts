import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export class CreateFreelanceJobDto {
  title: string; description: string; categoryId: string;
  budgetMin: number; budgetMax: number; pricingType?: string;
  deadlineDays: number; skills: string[];
  
  // New Freelance fields
  locationPreference?: string;
  experienceLevel?: string;
  attachments?: string[];
}
export class CreateBidDto {
  amount: number; timelineDays: number; coverLetter: string;
}

/** Service that handles freelance job CRUD, bidding, contract creation, and milestone approval */
@Injectable()
export class FreelanceService {
  constructor(private readonly prisma: PrismaService) {}

  /** Create a new freelance job listing for the given client */
  async createJob(clientId: string, dto: CreateFreelanceJobDto) {
    return this.prisma.freelanceJob.create({
      data: { ...dto, clientId, status: 'OPEN' },
      include: { category: true, client: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  /** Fetch all freelance categories ordered by label */
  async getCategories() {
    return this.prisma.freelanceCategory.findMany({ orderBy: { label: 'asc' } });
  }

  /** Search and paginate open/funded jobs with optional keyword and category filters */
  async findJobs(query: { q?: string; category?: string; page?: number; limit?: number }) {
    const pageNum = Number(query.page) || 1;
    const limitNum = Number(query.limit) || 20;
    const { q, category } = query;

    const where: Record<string, unknown> = { status: { in: ['OPEN', 'FUNDED'] } };
    if (category) where['category'] = { slug: category };
    if (q) where['OR'] = [
      { title:       { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];

    const [items, total] = await Promise.all([
      this.prisma.freelanceJob.findMany({
        where: where as never,
        include: { category: true, _count: { select: { bids: true } } },
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      this.prisma.freelanceJob.count({ where: where as never }),
    ]);

    return { data: items, items, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
  }

  /** Fetch a single job by ID including category, client, and bids */
  async findJobById(id: string) {
    const job = await this.prisma.freelanceJob.findUnique({
      where: { id },
      include: {
        category: true,
        client: { select: { id: true, firstName: true, lastName: true } },
        bids: {
          include: { freelancer: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!job) throw new NotFoundException('Gig not found');
    return job;
  }

  /** Submit a bid on an open/funded job; prevents duplicate bids from the same freelancer */
  async submitBid(freelancerId: string, gigId: string, dto: CreateBidDto) {
    const gig = await this.prisma.freelanceJob.findFirst({
      where: { id: gigId, status: { in: ['OPEN', 'FUNDED'] } },
    });
    if (!gig) throw new NotFoundException('Gig not found or no longer accepting bids');

    const existing = await this.prisma.bid.findUnique({
      where: { freelanceJobId_freelancerId: { freelanceJobId: gigId, freelancerId } },
    });
    if (existing) throw new ConflictException('You have already submitted a bid');

    return this.prisma.bid.create({ data: { ...dto, freelanceJobId: gigId, freelancerId } });
  }

  /** Accept a bid, reject others, create a contract and a chat room (all in a transaction) */
  async acceptBid(bidId: string, clientId: string) {
    const bid = await this.prisma.bid.findFirst({
      where: { id: bidId, freelanceJob: { clientId } },
    });
    if (!bid) throw new NotFoundException('Bid not found');

    const contract = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Accept chosen bid, reject others
      await tx.bid.update({ where: { id: bidId }, data: { status: 'ACCEPTED' } });
      await tx.bid.updateMany({
        where: { freelanceJobId: bid.freelanceJobId, id: { not: bidId } },
        data: { status: 'REJECTED' },
      });

      // Create contract
      const c = await tx.contract.create({
        data: { freelanceJobId: bid.freelanceJobId, clientId, freelancerId: bid.freelancerId, agreedAmount: bid.amount },
      });

      // Update gig status
      await tx.freelanceJob.update({
        where: { id: bid.freelanceJobId },
        data: { status: 'IN_PROGRESS' },
      });

      // Create a chat room for this contract
      await tx.chatRoom.create({
        data: {
          contractId: c.id,
          participants: { create: [{ userId: clientId }, { userId: bid.freelancerId }] },
        },
      });

      return c;
    });

    return contract;
  }

  /** List all bids submitted by a freelancer */
  async getMyBids(freelancerId: string) {
    return this.prisma.bid.findMany({
      where: { freelancerId },
      include: { freelanceJob: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** List all contracts where the user is either client or freelancer */
  async getMyContracts(userId: string) {
    return this.prisma.contract.findMany({
      where: { OR: [{ clientId: userId }, { freelancerId: userId }] },
      include: {
        freelanceJob: { include: { category: true } },
        client: { select: { id: true, firstName: true, lastName: true } },
        freelancer: { select: { id: true, firstName: true, lastName: true } },
        milestones: true,
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  /** Fetch a single contract by ID with milestones, deliverables, and user profiles */
  async getContract(id: string) {
    const c = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        milestones: { include: { deliverables: true } },
        freelanceJob: true,
        client:     { select: { id: true, firstName: true, lastName: true } },
        freelancer: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!c) throw new NotFoundException('Contract not found');
    return c;
  }

  /** Approve a milestone (client-only); marks it as APPROVED with a timestamp */
  async approveMilestone(milestoneId: string, clientId: string) {
    const m = await this.prisma.milestone.findFirst({
      where: { id: milestoneId, contract: { clientId } },
    });
    if (!m) throw new ForbiddenException('Not authorized or milestone not found');
    return this.prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: 'APPROVED', approvedAt: new Date() },
    });
  }
}
