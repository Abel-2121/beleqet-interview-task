import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';

/** Registers the admin controller for user management and dispute resolution. */
@Module({
  controllers: [AdminController],
})
export class AdminModule {}
