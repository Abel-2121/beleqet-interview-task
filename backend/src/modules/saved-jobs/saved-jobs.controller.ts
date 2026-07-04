import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { SavedJobsService } from './saved-jobs.service';
import { SaveJobDto } from './dto/save-job.dto';

/**
 * REST controller for managing a user's saved/bookmarked jobs.
 */
@ApiTags('saved-jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('saved-jobs')
export class SavedJobsController {
  constructor(private readonly svc: SavedJobsService) {}

  /** GET /saved-jobs — list all jobs saved by the current user. */
  @Get()
  @ApiOperation({ summary: 'Get saved jobs for current user' })
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.svc.findByUser(user.userId);
  }

  /** POST /saved-jobs — bookmark a job for the current user. */
  @Post()
  @ApiOperation({ summary: 'Save a job' })
  save(@CurrentUser() user: CurrentUserPayload, @Body() dto: SaveJobDto) {
    return this.svc.save(user.userId, dto.jobId);
  }

  /** DELETE /saved-jobs/:jobId — remove a previously saved bookmark. */
  @Delete(':jobId')
  @ApiOperation({ summary: 'Remove a saved job' })
  remove(@CurrentUser() user: CurrentUserPayload, @Param('jobId') jobId: string) {
    return this.svc.remove(user.userId, jobId);
  }
}
