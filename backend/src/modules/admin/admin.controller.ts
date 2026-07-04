import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

/** DTO for resolving an escrow dispute — requires a resolution description. */
class ResolveDisputeDto {
  @IsString()
  @MinLength(10, { message: 'Resolution must be at least 10 characters' })
  resolution: string;
}

/** Admin-only endpoints for user management and escrow dispute resolution. */
@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  /** List all users with basic profile info (admin only). */
  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  async getUsers() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
    });
  }

  /** Suspend a user account by setting isActive to false. */
  @Patch('users/:id/suspend')
  @ApiOperation({ summary: 'Suspend a user' })
  async suspendUser(@Param('id') id: string) {
    return this.prisma.user.update({ where: { id }, data: { isActive: false } });
  }

  /** List all escrow disputes with associated contract details. */
  @Get('escrow/disputes')
  @ApiOperation({ summary: 'List all escrow disputes' })
  async getDisputes() {
    return this.prisma.dispute.findMany({
      include: { contract: { include: { freelanceJob: true, client: true, freelancer: true } } },
    });
  }

  /** Resolve an escrow dispute with an admin's resolution note. */
  @Patch('disputes/:id/resolve')
  @ApiOperation({ summary: 'Resolve an escrow dispute' })
  async resolveDispute(@Param('id') id: string, @Body() dto: ResolveDisputeDto) {
    return this.prisma.dispute.update({
      where: { id },
      data: { resolution: dto.resolution, resolvedAt: new Date() },
    });
  }
}
