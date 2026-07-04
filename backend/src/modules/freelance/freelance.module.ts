import { Module } from '@nestjs/common';
import { FreelanceService } from './freelance.service';
import { FreelanceController } from './freelance.controller';

/** Module that manages freelance job listings, bidding, contracts, and milestones */
@Module({
  providers: [FreelanceService],
  controllers: [FreelanceController],
  exports: [FreelanceService],
})
export class FreelanceModule {}
