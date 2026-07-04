import {
  Injectable, NotFoundException, ConflictException, ForbiddenException, Logger,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateApplicationDto, UpdateApplicationDto } from './dto/create-application.dto';
import { QUEUE_NAMES, APPLICATION_JOBS, ANALYTICS_JOBS } from '../queues/queues.constants';

const applicationInclude = {
  user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
  job: { include: { company: { select: { id: true, name: true, userId: true } } } },
  score: true,
};

/**
 * Business logic for job applications — submission, screening orchestration, and lifecycle.
 */
@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    @InjectQueue(QUEUE_NAMES.APPLICATION)
    private readonly applicationQueue: Queue,
    @InjectQueue(QUEUE_NAMES.ANALYTICS)
    private readonly analyticsQueue: Queue,
  ) {}

  private mapApplication<T extends Record<string, unknown>>(application: T) {
    const record = application as T & {
      score?: { overallScore?: number; reasoning?: string } | null;
      job?: { company?: { name?: string } };
    };
    const overallScore = record.score?.overallScore;
    return {
      ...application,
      aiScore: overallScore != null ? Math.round(overallScore) : null,
      score: overallScore != null ? Math.round(overallScore) : null,
      aiFeedback: record.score?.reasoning ?? null,
      companyName: record.job?.company?.name ?? null,
    };
  }

  /** Submit a new application — validates job, enqueues AI screening and notifications. */
  async submit(userId: string, dto: CreateApplicationDto) {
    const job = await this.prisma.job.findFirst({
      where: { id: dto.jobId, status: 'PUBLISHED', filled: false },
      include: { company: true },
    });
    if (!job) {
      throw new NotFoundException(`Job ${dto.jobId} not found or no longer accepting applications`);
    }

    const existing = await this.prisma.application.findUnique({
      where: { jobId_userId: { jobId: dto.jobId, userId } },
    });
    if (existing) {
      throw new ConflictException('You have already applied to this job');
    }

    const application = await this.prisma.$transaction(async (tx: any) => {
      const app = await tx.application.create({
        data: {
          jobId: dto.jobId,
          userId,
          coverLetter: dto.coverLetter,
          resumeUrl: dto.resumeUrl,
          portfolioUrl: dto.portfolioUrl,
          expectedSalary: dto.expectedSalary,
          screeningAnswers: dto.screeningAnswers,
          status: 'SUBMITTED',
        },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          job: { select: { id: true, title: true, companyId: true, location: true, company: { select: { name: true } } } },
        },
      });

      await tx.eventLog.create({
        data: {
          eventType: 'application.submitted',
          entityId: app.id,
          entityType: 'Application',
          payload: {
            applicationId: app.id,
            jobId: dto.jobId,
            userId,
            jobTitle: job.title,
            companyId: job.companyId,
          },
          processedBy: ApplicationsService.name,
        },
      });

      return app;
    });

    this.applicationQueue.add(
      APPLICATION_JOBS.SCREEN_CANDIDATE,
      {
        applicationId: application.id,
        userId,
        jobId: dto.jobId,
        jobTitle: job.title,
        jobDescription: job.description,
        jobRequirements: job.requirements,
        coverLetter: dto.coverLetter,
        resumeUrl: dto.resumeUrl,
        companyId: job.companyId,
      },
      { priority: 1 },
    ).catch(err => this.logger.error('Failed to enqueue SCREEN_CANDIDATE', err.message));

    this.applicationQueue.add(
      APPLICATION_JOBS.NOTIFY_RECRUITER,
      {
        applicationId: application.id,
        jobId: dto.jobId,
        jobTitle: job.title,
        companyId: job.companyId,
        applicantName: `${application.user.firstName} ${application.user.lastName}`,
      },
      { priority: 2 },
    ).catch(err => this.logger.error('Failed to enqueue NOTIFY_RECRUITER', err.message));

    this.analyticsQueue.add(
      ANALYTICS_JOBS.UPDATE_JOB_STATS,
      { jobId: dto.jobId },
    ).catch(err => this.logger.error('Failed to enqueue UPDATE_JOB_STATS', err.message));

    this.eventEmitter.emit('application.submitted', {
      applicationId: application.id,
      jobId: dto.jobId,
      userId,
    });

    this.logger.log(`Application ${application.id} submitted — screening queued`);
    return this.mapApplication(application);
  }

  /** Return all applications submitted by the given user. */
  async findByUser(userId: string) {
    const items = await this.prisma.application.findMany({
      where: { userId },
      include: applicationInclude,
      orderBy: { createdAt: 'desc' },
    });
    return items.map((app) => this.mapApplication(app));
  }

  /** Return all applications for a given job (employer/admin only). */
  async findByJob(jobId: string, employerId: string, role: string) {
    const job = role === 'ADMIN'
      ? await this.prisma.job.findUnique({ where: { id: jobId } })
      : await this.prisma.job.findFirst({
          where: { id: jobId, company: { userId: employerId } },
        });
    if (!job) throw new NotFoundException('Job not found');

    const items = await this.prisma.application.findMany({
      where: { jobId },
      include: applicationInclude,
      orderBy: [{ score: { overallScore: 'desc' } }, { createdAt: 'asc' }],
    });
    return items.map((app) => this.mapApplication(app));
  }

  /** Aggregate all applications across the employer's jobs with stats. */
  async findAllForEmployer(employerId: string) {
    const jobs = await this.prisma.job.findMany({
      where: { company: { userId: employerId } },
      select: { id: true, title: true, status: true, _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const jobIds = jobs.map((j) => j.id);

    const items = jobIds.length
      ? await this.prisma.application.findMany({
          where: { jobId: { in: jobIds } },
          include: applicationInclude,
          orderBy: { createdAt: 'desc' },
        })
      : [];

    const mapped = items.map((app) => this.mapApplication(app));
    return {
      stats: this.buildStats(mapped),
      jobs,
      data: mapped,
    };
  }

  /** Return all applications system-wide with aggregate stats (admin only). */
  async findAllAdmin() {
    const items = await this.prisma.application.findMany({
      include: applicationInclude,
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    const mapped = items.map((app) => this.mapApplication(app));
    return {
      stats: this.buildStats(mapped),
      data: mapped,
    };
  }

  private buildStats(applications: Array<{ status: string }>) {
    const counts: Record<string, number> = {};
    for (const app of applications) {
      counts[app.status] = (counts[app.status] || 0) + 1;
    }
    return {
      total: applications.length,
      submitted: counts.SUBMITTED || 0,
      screening: counts.SCREENING || 0,
      shortlisted: counts.SHORTLISTED || 0,
      interview: counts.INTERVIEW_SCHEDULED || 0,
      offered: counts.OFFERED || 0,
      rejected: counts.REJECTED || 0,
      withdrawn: counts.WITHDRAWN || 0,
    };
  }

  /** Find a single application by ID, enforcing owner/employer/admin access. */
  async findOne(id: string, userId: string, role: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: applicationInclude,
    });
    if (!application) throw new NotFoundException(`Application ${id} not found`);

    const isOwner = application.userId === userId;
    const isEmployer = application.job.company?.userId === userId;
    const isAdmin = role === 'ADMIN';

    if (!isOwner && !isEmployer && !isAdmin) {
      throw new ForbiddenException('You do not have access to this application');
    }

    return this.mapApplication(application);
  }

  /** Update the status of an application (employer or admin). */
  async updateStatus(
    id: string,
    status: string,
    actorId: string,
    role: string,
    notes?: string,
  ) {
    const application = role === 'ADMIN'
      ? await this.prisma.application.findUnique({ where: { id } })
      : await this.prisma.application.findFirst({
          where: { id, job: { company: { userId: actorId } } },
        });

    if (!application) {
      throw new NotFoundException(`Application ${id} not found or you don't have permission to update it`);
    }

    const updated = await this.prisma.application.update({
      where: { id },
      data: {
        status: status as never,
        ...(notes !== undefined && { notes }),
      },
      include: applicationInclude,
    });

    return this.mapApplication(updated);
  }

  /** Update application content (cover letter, resume, etc.) while still editable. */
  async update(userId: string, id: string, dto: UpdateApplicationDto) {
    const application = await this.prisma.application.findFirst({
      where: { id, userId },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    if (!['SUBMITTED', 'SCREENING'].includes(application.status)) {
      throw new ConflictException('Application can no longer be edited');
    }

    const data: Record<string, any> = {};
    if (dto.coverLetter !== undefined) data.coverLetter = dto.coverLetter;
    if (dto.resumeUrl !== undefined) data.resumeUrl = dto.resumeUrl;
    if (dto.portfolioUrl !== undefined) data.portfolioUrl = dto.portfolioUrl;
    if (dto.expectedSalary !== undefined) data.expectedSalary = dto.expectedSalary;
    if (dto.screeningAnswers !== undefined) data.screeningAnswers = dto.screeningAnswers;

    const updated = await this.prisma.application.update({
      where: { id },
      data,
      include: applicationInclude,
    });
    return this.mapApplication(updated);
  }

  /** Withdraw an application (candidate only); rejects if already withdrawn. */
  async withdraw(userId: string, id: string, reason?: string) {
    const application = await this.prisma.application.findFirst({
      where: { id, userId },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.status === 'WITHDRAWN') {
      throw new ConflictException('Application already withdrawn');
    }

    const updated = await this.prisma.application.update({
      where: { id },
      data: { status: 'WITHDRAWN' },
      include: applicationInclude,
    });
    return this.mapApplication(updated);
  }

  /** Schedule an interview for the candidate by updating status and slot. */
  async scheduleInterview(id: string, dto: any, employerId: string) {
    const application = await this.prisma.application.findFirst({
      where: { id, job: { company: { userId: employerId } } },
    });
    if (!application) throw new NotFoundException('Application not found');
    const updated = await this.prisma.application.update({
      where: { id },
      data: { status: 'INTERVIEW_SCHEDULED', interviewSlot: new Date(dto.dateTime), notes: dto.notes },
      include: applicationInclude,
    });
    return this.mapApplication(updated);
  }

  /** Send a job offer to the candidate (employer only). */
  async sendOffer(id: string, dto: any, employerId: string) {
    const application = await this.prisma.application.findFirst({
      where: { id, job: { company: { userId: employerId } } },
    });
    if (!application) throw new NotFoundException('Application not found');
    const updated = await this.prisma.application.update({
      where: { id },
      data: { status: 'OFFERED', notes: dto.message || null },
      include: applicationInclude,
    });
    return this.mapApplication(updated);
  }

  /** Accept or decline a job offer from the candidate side. */
  async respondToOffer(id: string, dto: any, userId: string) {
    const application = await this.prisma.application.findFirst({
      where: { id, userId },
    });
    if (!application) throw new NotFoundException('Application not found');
    const status = dto.response === 'ACCEPTED' ? 'OFFER_ACCEPTED' : 'OFFER_DECLINED';
    const updated = await this.prisma.application.update({
      where: { id },
      data: { status: status as any, notes: dto.message || null },
      include: applicationInclude,
    });
    return this.mapApplication(updated);
  }

  /** Update status for multiple applications at once (employer/admin). */
  async bulkUpdateStatus(dto: any, employerId: string, role: string) {
    const ids = dto.ids || [];
    const results = [];
    for (const id of ids) {
      try {
        const result = await this.updateStatus(id, dto.status, employerId, role, dto.notes);
        results.push(result);
      } catch { continue; }
    }
    return results;
  }

  /** Advanced filtered/paginated search over applications (employer/admin). */
  async getFilteredApplications(userId: string, filters: any, _role: string) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.jobId) where.jobId = filters.jobId;
    if (filters.search) {
      where.OR = [
        { user: { firstName: { contains: filters.search, mode: 'insensitive' } } },
        { user: { lastName: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.application.findMany({ where, include: applicationInclude, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.application.count({ where }),
    ]);
    return { data: items.map((app) => this.mapApplication(app)), total, page, totalPages: Math.ceil(total / limit) };
  }
}
