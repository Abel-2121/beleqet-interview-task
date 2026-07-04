import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QUEUE_NAMES } from './queues.constants';

const queues = Object.values(QUEUE_NAMES).map((name) =>
  BullModule.registerQueue({ name }),
);

/** Module that registers all BullMQ queues defined in QUEUE_NAMES so they can be injected by name across the app. */
@Module({
  imports: queues,
  exports: queues,
})
export class QueuesModule {}
