// freelance.controller.ts
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { FreelanceService, CreateFreelanceJobDto, CreateBidDto } from './freelance.service';

/** REST controller for freelance jobs, bids, contracts, and milestone approval */
@ApiTags('freelance')
@Controller('freelance')
export class FreelanceController {
  constructor(private readonly svc: FreelanceService) {}

  /** GET /freelance/jobs — List/search freelance jobs with pagination and category filter */
  @Get('jobs')
  findJobs(@Query() q: { q?: string; category?: string; page?: number; limit?: number }) { return this.svc.findJobs(q); }

  /** GET /freelance/categories — List all freelance categories */
  @Get('categories')
  getCategories() { return this.svc.getCategories(); }

  /** GET /freelance/jobs/:id — Get a single job with bids */
  @Get('jobs/:id')
  findJob(@Param('id') id: string) { return this.svc.findJobById(id); }

  /** POST /freelance/jobs — Create a new freelance job listing (auth required) */
  @Post('jobs')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  createJob(@CurrentUser() u: CurrentUserPayload, @Body() dto: CreateFreelanceJobDto) { return this.svc.createJob(u.userId, dto); }

  /** POST /freelance/jobs/:id/bids — Submit a bid on a job (auth required) */
  @Post('jobs/:id/bids')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  submitBid(@Param('id') id: string, @CurrentUser() u: CurrentUserPayload, @Body() dto: CreateBidDto) { return this.svc.submitBid(u.userId, id, dto); }

  /** PATCH /freelance/bids/:id/accept — Accept a bid, reject others, and create a contract + chat room */
  @Patch('bids/:id/accept')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  acceptBid(@Param('id') id: string, @CurrentUser() u: CurrentUserPayload) { return this.svc.acceptBid(id, u.userId); }

  /** GET /freelance/my-bids — List the authenticated user's bids */
  @Get('my-bids')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  myBids(@CurrentUser() u: CurrentUserPayload) { return this.svc.getMyBids(u.userId); }

  /** GET /freelance/contracts/my — List all contracts for the authenticated user */
  @Get('contracts/my')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  myContracts(@CurrentUser() u: CurrentUserPayload) { return this.svc.getMyContracts(u.userId); }

  /** GET /freelance/contracts/:id — Get a single contract with milestones and deliverables */
  @Get('contracts/:id')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  contract(@Param('id') id: string) { return this.svc.getContract(id); }

  /** PATCH /freelance/milestones/:id/approve — Approve a milestone (client only) */
  @Patch('milestones/:id/approve')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  approveMilestone(@Param('id') id: string, @CurrentUser() u: CurrentUserPayload) { return this.svc.approveMilestone(id, u.userId); }
}
