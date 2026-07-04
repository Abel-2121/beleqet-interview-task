import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Business logic for saving/bookmarking jobs for later review.
 */
@Injectable()
export class SavedJobsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Return all saved jobs for the given user, including job details. */
  async findByUser(userId: string) {
    const saved = await this.prisma.savedJob.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            company: true,
            category: true,
            _count: { select: { applications: true } },
          },
        },
      },
      orderBy: { savedAt: 'desc' },
    });

    return saved.map((s) => ({
      id: s.id,
      jobId: s.jobId,
      savedAt: s.savedAt,
      job: s.job,
    }));
  }

  /** Save/bookmark a job for the user; throws if already saved. */
  async save(userId: string, jobId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');

    const existing = await this.prisma.savedJob.findUnique({
      where: { userId_jobId: { userId, jobId } },
    });
    if (existing) throw new ConflictException('Job already saved');

    return this.prisma.savedJob.create({
      data: { userId, jobId },
      include: {
        job: { include: { company: true, category: true } },
      },
    });
  }

  /** Remove a previously saved job bookmark. */
  async remove(userId: string, jobId: string) {
    const result = await this.prisma.savedJob.deleteMany({
      where: { userId, jobId },
    });
    if (result.count === 0) throw new NotFoundException('Saved job not found');
    return { success: true };
  }
}
