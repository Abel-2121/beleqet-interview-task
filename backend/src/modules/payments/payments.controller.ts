import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { InitiatePlanDto } from './dto/initiate-plan.dto';

/** Handles HTTP routes for employer plan payments and Chapa webhook callbacks */
@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly svc: PaymentsService,
    private readonly config: ConfigService,
  ) {}

  /** Returns all available employer pricing plans */
  @Get('plans')
  @ApiOperation({ summary: 'List employer pricing plans' })
  listPlans() {
    return this.svc.getPlans();
  }

  /** Initiates a Chapa checkout session for the selected employer plan */
  @Post('plans/checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate Chapa checkout for an employer plan' })
  checkout(@CurrentUser() user: CurrentUserPayload, @Body() body: InitiatePlanDto) {
    return this.svc.initiatePlanCheckout(user.userId, body.planId);
  }

  /** Redirects the user after Chapa payment with success/failure status */
  @Get('plans/return')
  async handleReturn(
    @Query('tx_ref') txRef: string,
    @Query('plan') plan: string,
    @Res() res: Response,
  ) {
    const frontend = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    if (!txRef) {
      return res.redirect(`${frontend}/pricing/success?payment=error&reason=missing_tx_ref`);
    }

    try {
      const result = await this.svc.verifyPlanPayment(txRef, plan);
      if (result.success) {
        return res.redirect(
          `${frontend}/pricing/success?payment=success&tx_ref=${encodeURIComponent(txRef)}&plan=${result.planId ?? plan ?? ''}`,
        );
      }
      return res.redirect(
        `${frontend}/pricing/success?payment=failed&tx_ref=${encodeURIComponent(txRef)}&plan=${plan ?? ''}`,
      );
    } catch {
      return res.redirect(`${frontend}/pricing/success?payment=error&reason=server_error`);
    }
  }

  /** Receives Chapa webhook callbacks to verify asynchronous payment notifications */
  @Post('plans/callback')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Body() payload: Record<string, unknown>,
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('chapa-signature') chapaSignature?: string,
    @Headers('x-chapa-signature') xChapaSignature?: string,
  ) {
    const signature = chapaSignature || xChapaSignature;
    const secret = this.config.get<string>('CHAPA_WEBHOOK_SECRET');
    const isProduction = this.config.get<string>('NODE_ENV') === 'production';

    if (isProduction && secret && req.rawBody && signature) {
      const hash = crypto.createHmac('sha256', secret).update(req.rawBody).digest('hex');
      if (hash !== signature) {
        throw new UnauthorizedException('Invalid Webhook Signature');
      }
    }

    const txRef =
      (payload.tx_ref as string) ||
      (payload.reference as string) ||
      (payload.trx_ref as string);

    if (txRef) {
      await this.svc.verifyPlanPayment(txRef);
    }

    return { received: true };
  }
}
