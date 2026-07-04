import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJobDto, QueryJobsDto } from './dto/create-job.dto';

/**
 * Business logic for job listings — CRUD, search, categories, and stats.
 */
@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  private mapJob<T extends Record<string, unknown>>(job: T) {
    const record = job as T & {
      status?: string;
      filled?: boolean;
      _count?: { applications?: number };
    };
    return {
      ...job,
      isActive: record.status === 'PUBLISHED' && !record.filled,
      applicationCount: record._count?.applications ?? 0,
    };
  }

  /** Create a new job listing, linked to the employer's company. */
  async create(employerId: string, dto: CreateJobDto) {
    const company = await this.prisma.company.findUnique({ where: { userId: employerId } });
    if (!company) throw new ForbiddenException('Create a company profile before posting jobs');

    const data: any = { ...dto, companyId: company.id, status: dto.status || 'PUBLISHED' };
    if (data.deadline) data.deadline = new Date(data.deadline);
    if (data.expiryDate) data.expiryDate = new Date(data.expiryDate);

    return this.prisma.job.create({
      data,
      include: { company: true, category: true },
    });
  }

  private async resolveCategoryId(category: string): Promise<string | null> {
    const cat = await this.prisma.jobCategory.findFirst({
      where: { OR: [{ id: category }, { slug: category }] },
    });
    return cat?.id ?? null;
  }

  /** Fetch all job categories, each annotated with the count of published jobs. */
  async getCategories() {
    const categories = await this.prisma.jobCategory.findMany({
      orderBy: { label: 'asc' },
    });

    const counts = await this.prisma.job.groupBy({
      by: ['categoryId'],
      where: { status: 'PUBLISHED' },
      _count: true,
    });

    const countMap = new Map(counts.map(c => [c.categoryId, c._count]));

    return categories.map(cat => ({
      id: cat.id,
      slug: cat.slug,
      label: cat.label,
      name: cat.label,
      jobCount: countMap.get(cat.id) || 0,
    }));
  }

  /** Return aggregate platform statistics for the homepage. */
  async getStats() {
    const [jobs, companies, candidates, applications] = await Promise.all([
      this.prisma.job.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.company.count(),
      this.prisma.user.count({ where: { role: 'JOB_SEEKER' } }),
      this.prisma.application.count(),
    ]);

    return { jobs, companies, candidates, applications };
  }

  /** Search published jobs with paginated, filtered results (text, category, location, type). */
  async findAll(query: QueryJobsDto) {
    const pageNum = Number(query.page) || 1;
    const limitNum = Number(query.limit) || 20;
    const { q, category, location, type, featured } = query;

    const where: any = { status: 'PUBLISHED' };
    if (type) where.type = type;
    if (featured === true || (featured as unknown) === 'true') where.featured = true;
    if (category) {
      const categoryId = await this.resolveCategoryId(category);
      if (categoryId) {
        where.categoryId = categoryId;
      } else {
        return { data: [], total: 0, page: pageNum, totalPages: 0 };
      }
    }
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: { company: true, category: true, _count: { select: { applications: true } } },
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      this.prisma.job.count({ where }),
    ]);

    return { data: items.map((job) => this.mapJob(job)), total, page: pageNum, totalPages: Math.ceil(total / limitNum) };
  }

  /** Find a single job by ID, with company and category included. */
  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { company: true, category: true, _count: { select: { applications: true } } },
    });
    if (!job) throw new NotFoundException(`Job ${id} not found`);
    return this.mapJob(job);
  }

  /** Update a job listing — only the owning employer can modify it. */
  async update(id: string, employerId: string, dto: Partial<CreateJobDto>) {
    const job = await this.prisma.job.findFirst({ where: { id, company: { userId: employerId } } });
    if (!job) throw new NotFoundException('Job not found or access denied');
    return this.prisma.job.update({ where: { id }, data: dto as never });
  }

  /** Soft-delete a job by setting its status to ARCHIVED. */
  async remove(id: string, employerId: string) {
    const job = await this.prisma.job.findFirst({ where: { id, company: { userId: employerId } } });
    if (!job) throw new NotFoundException('Job not found or access denied');
    return this.prisma.job.update({ where: { id }, data: { status: 'ARCHIVED' } });
  }

  /** Fetch all jobs belonging to the employer's company, with application counts. */
  async findByCompany(employerId: string) {
    return this.prisma.job.findMany({
      where: { company: { userId: employerId } },
      include: { category: true, _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
