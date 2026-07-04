// users.controller.ts
import { Controller, Get, Patch, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto, CreateCompanyDto } from './dto/update-user.dto';

/** Handles authenticated user operations: profile, company, and notifications. */
@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  /** Get the authenticated user's profile. */
  @Get('profile')
  profile(@CurrentUser() u: CurrentUserPayload) { return this.svc.findById(u.userId); }

  /** Update the authenticated user's profile fields. */
  @Patch('profile')
  update(@CurrentUser() u: CurrentUserPayload, @Body() dto: UpdateUserDto) { return this.svc.update(u.userId, dto); }

  /** Get the authenticated user's company details with recent jobs. */
  @Get('company')
  getCompany(@CurrentUser() u: CurrentUserPayload) { return this.svc.getCompany(u.userId); }

  /** Create a new company profile for the authenticated user. */
  @Post('company')
  createCompany(@CurrentUser() u: CurrentUserPayload, @Body() dto: CreateCompanyDto) { return this.svc.createCompany(u.userId, dto); }

  /** Update the authenticated user's company profile. */
  @Patch('company')
  updateCompany(@CurrentUser() u: CurrentUserPayload, @Body() dto: CreateCompanyDto) { return this.svc.updateCompany(u.userId, dto); }

  /** Get the authenticated user's recent notifications. */
  @Get('notifications')
  notifications(@CurrentUser() u: CurrentUserPayload) { return this.svc.getNotifications(u.userId); }

  /** Mark a specific notification as read. */
  @Patch('notifications/:id/read')
  markRead(@Param('id') id: string, @CurrentUser() u: CurrentUserPayload) { return this.svc.markNotificationRead(id, u.userId); }
}
