import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QUEUE_NAMES } from '../queues/queues.constants';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { WalletProcessor } from './wallet.processor';

/** WalletModule — manages freelancer wallet balances, transactions, and withdrawals via Bull queue */
@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_NAMES.WALLET })],
  providers: [WalletService, WalletProcessor],
  controllers: [WalletController],
})
export class WalletModule {}
