import { Module } from '@nestjs/common';
import { SavedJobsService } from './saved-jobs.service';
import { SavedJobsController } from './saved-jobs.controller';

/**
 * Registers the SavedJobs module — lets users bookmark jobs for later.
 */
@Module({
  providers: [SavedJobsService],
  controllers: [SavedJobsController],
})
export class SavedJobsModule {}
