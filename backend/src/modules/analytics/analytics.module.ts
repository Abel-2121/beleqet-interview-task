import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QUEUE_NAMES } from '../queues/queues.constants';
import { AnalyticsProcessor } from './analytics.processor';

/** AnalyticsModule — processes analytics events and job application stats via Bull queue */
@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_NAMES.ANALYTICS })],
  providers: [AnalyticsProcessor],
})
export class AnalyticsModule {}
