import { Controller, Post, Get, Patch, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { ApplicationsService } from './applications.service';
import { 
  CreateApplicationDto, 
  UpdateApplicationDto,
  UpdateApplicationStatusDto,
  ScheduleInterviewDto,
  SendOfferDto,
  RespondToOfferDto,
  BulkUpdateStatusDto,
  ApplicationFiltersDto
} from './dto/create-application.dto';

/**
 * REST controller for job applications — submit, review, interview, offer flow.
 */
@ApiTags('applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly svc: ApplicationsService) {}

  /** POST /applications — submit an application; enqueues AI screening and notifications. */
  @Post()
  @ApiOperation({ summary: 'Submit a job application — triggers AI screening workflow' })
  submit(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateApplicationDto) {
    return this.svc.submit(user.userId, dto);
  }

  /** GET /applications/my — list the current user's submitted applications. */
  @Get('my')
  @ApiOperation({ summary: 'Get all applications for the current user' })
  myApplications(@CurrentUser() user: CurrentUserPayload) {
    return this.svc.findByUser(user.userId);
  }

  /** GET /applications/job/:jobId — list applications for a specific job (employer). */
  @Get('job/:jobId')
  @ApiOperation({ summary: 'Get all applications for a job (employer only)' })
  byJob(@Param('jobId') jobId: string, @CurrentUser() user: CurrentUserPayload) {
    return this.svc.findByJob(jobId, user.userId, user.role);
  }

  /** PATCH /applications/bulk/status — update status for multiple applications at once. */
  @Patch('bulk/status')
  @ApiOperation({ summary: 'Bulk update application status (employer only)' })
  bulkUpdateStatus(
    @Body() dto: BulkUpdateStatusDto,
    @CurrentUser() user: CurrentUserPayload
  ) {
    return this.svc.bulkUpdateStatus(dto, user.userId, user.role);
  }

  /** GET /applications/:id — get a single application by ID (owner/employer/admin). */
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.svc.findOne(id, user.userId, user.role);
  }

  /** PATCH /applications/:id — update cover letter/resume etc. while still editable. */
  @Patch(':id')
  @ApiOperation({ summary: 'Update application content (candidate only)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
    @CurrentUser() user: CurrentUserPayload
  ) {
    return this.svc.update(user.userId, id, dto);
  }

  /** PATCH /applications/:id/status — change application status (employer or admin). */
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update application status (employer action)' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
    @CurrentUser() user: CurrentUserPayload
  ) {
    return this.svc.updateStatus(id, dto.status, user.userId, user.role, dto.notes);
  }

  /** POST /applications/:id/schedule-interview — set interview slot (employer). */
  @Post(':id/schedule-interview')
  @ApiOperation({ summary: 'Schedule an interview for a candidate (employer only)' })
  scheduleInterview(
    @Param('id') id: string,
    @Body() dto: ScheduleInterviewDto,
    @CurrentUser() user: CurrentUserPayload
  ) {
    return this.svc.scheduleInterview(id, dto, user.userId);
  }

  /** POST /applications/:id/send-offer — extend a job offer (employer). */
  @Post(':id/send-offer')
  @ApiOperation({ summary: 'Send a job offer to a candidate (employer only)' })
  sendOffer(
    @Param('id') id: string,
    @Body() dto: SendOfferDto,
    @CurrentUser() user: CurrentUserPayload
  ) {
    return this.svc.sendOffer(id, dto, user.userId);
  }

  /** POST /applications/:id/respond-offer — accept or decline a received offer. */
  @Post(':id/respond-offer')
  @ApiOperation({ summary: 'Accept or decline a job offer (candidate only)' })
  respondToOffer(
    @Param('id') id: string,
    @Body() dto: RespondToOfferDto,
    @CurrentUser() user: CurrentUserPayload
  ) {
    return this.svc.respondToOffer(id, dto, user.userId);
  }

  /** GET /applications/filtered — advanced filtered search for employer/admin. */
  @Get('filtered')
  @ApiOperation({ summary: 'Get filtered applications with advanced search (employer/admin)' })
  getFilteredApplications(
    @Query() filters: ApplicationFiltersDto,
    @CurrentUser() user: CurrentUserPayload
  ) {
    return this.svc.getFilteredApplications(user.userId, filters, user.role);
  }

  /** PATCH /applications/:id/withdraw — withdraw an application (candidate only). */
  @Patch(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw an application (candidate only)' })
  withdraw(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @CurrentUser() user: CurrentUserPayload
  ) {
    return this.svc.withdraw(user.userId, id, body?.reason);
  }
}
