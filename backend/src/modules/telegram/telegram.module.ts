import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { PrismaModule } from '../../prisma/prisma.module';

/** TelegramModule — integrates a Telegram bot for user notifications and /start command handling */
@Module({
  imports: [PrismaModule],
  providers: [TelegramService],
  exports: [TelegramService]
})
export class TelegramModule {}
