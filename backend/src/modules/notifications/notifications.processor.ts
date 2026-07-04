import { Processor, Process } from '@nestjs/bull';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { QUEUE_NAMES, NOTIFICATION_JOBS } from '../queues/queues.constants';

interface InAppPayload {
  userId: string;
  type: string;
  title: string;
  body: string;
  metadata?: object;
}

interface TelegramPayload {
  telegramId: string;
  message: string;
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  templateParams?: Record<string, string>;
}

@Injectable()
@Processor(QUEUE_NAMES.NOTIFICATIONS)
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @Process(NOTIFICATION_JOBS.SEND_IN_APP)
  async sendInApp(job: Job<InAppPayload>) {
    const { userId, type, title, body, metadata } = job.data;
    if (!userId) return;
    await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        channel: 'IN_APP',
        metadata: metadata as never,
      },
    });
    this.logger.debug(`In-app → ${userId}: ${title}`);
  }

  @Process(NOTIFICATION_JOBS.SEND_TELEGRAM)
  async sendTelegram(job: Job<TelegramPayload>) {
    const botToken = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!botToken) return;
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: job.data.telegramId,
          text: job.data.message,
          parse_mode: 'Markdown',
        }),
      });
      this.logger.debug(`Telegram → ${job.data.telegramId}`);
    } catch (e) {
      this.logger.warn(`Telegram failed: ${(e as Error).message}`);
    }
  }

  @Process(NOTIFICATION_JOBS.SEND_EMAIL)
  async sendEmail(job: Job<EmailPayload>) {
    const { to, subject, html, templateParams } = job.data;
    if (!to) return;

    const serviceId = this.config.get<string>('EMAILJS_SERVICE_ID')
      || this.config.get<string>('NEXT_PUBLIC_EMAILJS_SERVICE_ID');
    const templateId = this.config.get<string>('EMAILJS_TEMPLATE_ID')
      || this.config.get<string>('NEXT_PUBLIC_EMAILJS_TEMPLATE_ID');
    const publicKey = this.config.get<string>('EMAILJS_PUBLIC_KEY')
      || this.config.get<string>('NEXT_PUBLIC_EMAILJS_PUBLIC_KEY');

    if (!serviceId || !templateId || !publicKey) {
      this.logger.warn('EmailJS not configured — email not sent');
      return;
    }

    const params = templateParams ?? {
      to_email: to,
      reply_to: to,
      subject,
      message: html,
    };

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: params,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`EmailJS ${response.status}: ${text}`);
      }

      this.logger.debug(`EmailJS → ${to}: ${subject}`);
    } catch (e) {
      this.logger.warn(`EmailJS failed: ${(e as Error).message}`);
    }
  }
}
