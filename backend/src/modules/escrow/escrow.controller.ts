import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { EscrowService } from './escrow.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Request, Response } from 'express';

@ApiTags('escrow')
@Controller('escrow')
export class EscrowController {
  constructor(
    private readonly svc: EscrowService,
    private readonly config: ConfigService,
  ) {}

  @Post('initiate/:gigId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  initiate(@Param('gigId') gigId: string, @CurrentUser() u: CurrentUserPayload) {
    return this.svc.initiate(u.userId, gigId);
  }

  @Get('status/:txRef')
  @ApiOperation({ summary: 'Get escrow status by Chapa tx_ref' })
  getStatus(@Param('txRef') txRef: string) {
    return this.svc.getEscrowStatus(txRef);
  }

  /** Browser return from Chapa — verify server-side then redirect to frontend */
  @Get('return')
  async handleReturn(@Query('tx_ref') txRef: string, @Res() res: Response) {
    const frontend = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    if (!txRef) {
      return res.redirect(`${frontend}/freelance/payment-success?payment=error&reason=missing_tx_ref`);
    }

    try {
      const result = await this.svc.verifyAndProcessPayment(txRef);
      if (result.success) {
        return res.redirect(
          `${frontend}/freelance/payment-success?payment=success&tx_ref=${encodeURIComponent(txRef)}&escrowId=${result.escrowId ?? ''}`,
        );
      }
      return res.redirect(
        `${frontend}/freelance/payment-success?payment=failed&tx_ref=${encodeURIComponent(txRef)}`,
      );
    } catch {
      return res.redirect(`${frontend}/freelance/payment-success?payment=error&reason=server_error`);
    }
  }

  /** Chapa webhook — verify signature (prod) then verify payment server-side */
  @Post('callback')
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
      await this.svc.verifyAndProcessPayment(txRef);
    } else {
      await this.svc.handleWebhook(payload);
    }

    return { received: true };
  }

  @Post('milestones/:id/release')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  release(@Param('id') id: string, @CurrentUser() u: CurrentUserPayload) {
    return this.svc.releaseMilestone(id, u.userId);
  }
}
