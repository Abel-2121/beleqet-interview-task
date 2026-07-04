import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** DTO for saving a job — contains only the jobId to bookmark. */
export class SaveJobDto {
  @ApiProperty({ description: 'Job ID to save' })
  @IsUUID()
  jobId: string;
}
