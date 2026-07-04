import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EmployerPlanId } from '../payments.service';

export class InitiatePlanDto {
  @ApiProperty({ enum: ['basic', 'featured', 'enterprise'] })
  @IsIn(['basic', 'featured', 'enterprise'])
  planId!: EmployerPlanId;
}
