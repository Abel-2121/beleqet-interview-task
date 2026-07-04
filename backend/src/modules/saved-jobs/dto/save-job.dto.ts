import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveJobDto {
  @ApiProperty({ description: 'Job ID to save' })
  @IsUUID()
  jobId: string;
}
