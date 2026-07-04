import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { JobsService } from './jobs.service';
import { CreateJobDto, QueryJobsDto } from './dto/create-job.dto';

/**
 * REST controller for job listing CRUD, search, and category retrieval.
 */
@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly svc: JobsService) {}

  /** GET /jobs — search and browse published job listings with optional filters. */
  @Get()
  @ApiOperation({ summary: 'Search & browse job listings (public)' })
  findAll(@Query() query: QueryJobsDto) {
    return this.svc.findAll(query);
  }

  /** GET /jobs/my — returns all jobs belonging to the authenticated employer. */
  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER', 'ADMIN')
  @ApiBearerAuth()
  myJobs(@CurrentUser() user: CurrentUserPayload) {
    return this.svc.findByCompany(user.userId);
  }

  /** GET /jobs/categories — list all job categories with live job counts. */
  @Get('categories')
  @ApiOperation({ summary: 'Get all job categories' })
  getCategories() {
    return this.svc.getCategories();
  }

  /** GET /jobs/stats — return aggregate platform stats (jobs, companies, etc.). */
  @Get('stats')
  @ApiOperation({ summary: 'Platform statistics for homepage' })
  getStats() {
    return this.svc.getStats();
  }

  /** GET /jobs/:id — get a single job listing by ID. */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  /** POST /jobs — create a new job listing (employer only). */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a job listing (employer only)' })
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateJobDto) {
    return this.svc.create(user.userId, dto);
  }

  /** PATCH /jobs/:id — partially update a job listing (owner only). */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER', 'ADMIN')
  @ApiBearerAuth()
  update(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload, @Body() dto: Partial<CreateJobDto>) {
    return this.svc.update(id, user.userId, dto);
  }

  /** DELETE /jobs/:id — archive a job listing (soft-delete, sets status to ARCHIVED). */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER', 'ADMIN')
  @ApiBearerAuth()
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.svc.remove(id, user.userId);
  }
}
