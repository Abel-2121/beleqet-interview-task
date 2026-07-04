import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QUEUE_NAMES } from '../queues/queues.constants';
import { NotificationsProcessor } from './notifications.processor';

/** NotificationsModule — processes queued in-app, Telegram, and email notifications via Bull */
@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_NAMES.NOTIFICATIONS })],
  providers: [NotificationsProcessor],
  exports: [NotificationsProcessor],
})
export class NotificationsModule {}
