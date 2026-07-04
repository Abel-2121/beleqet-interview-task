// dto/create-application.dto.ts
import { IsUUID, IsString, IsOptional, IsUrl, MinLength, MaxLength, IsInt, IsObject, IsEnum, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** DTO for submitting a new job application. */
export class CreateApplicationDto {
  @ApiProperty({ description: 'UUID of the job being applied to', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  jobId: string;

  @ApiProperty({ required: false, example: 'I am writing to express my interest in this position. I have over 5 years of experience building scalable backend APIs using NestJS and PostgreSQL...' })
  @IsOptional()
  @IsString()
  @MinLength(20, { message: 'Cover letter must be at least 20 characters long' })
  @MaxLength(10000)
  coverLetter?: string;

  @ApiProperty({ required: false, description: 'URL to uploaded resume/CV', example: 'https://example.com/resume.pdf' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  resumeUrl?: string;

  // New Application fields
  @ApiProperty({ required: false, example: { "Why do you want this job?": "I love coding." } })
  @IsOptional()
  @IsObject()
  screeningAnswers?: Record<string, any>;

  @ApiProperty({ required: false, example: 'https://github.com/beleqet' })
  @IsOptional()
  @IsUrl()
  portfolioUrl?: string;

  @ApiProperty({ required: false, example: 50000 })
  @IsOptional()
  @IsInt()
  expectedSalary?: number;
}

/** Enum representing all possible states of an application lifecycle. */
export enum ApplicationStatus {
  SUBMITTED = 'SUBMITTED',
  SCREENING = 'SCREENING',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEW_COMPLETED = 'INTERVIEW_COMPLETED',
  OFFERED = 'OFFERED',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  OFFER_DECLINED = 'OFFER_DECLINED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
  HIRED = 'HIRED',
}

/** DTO for updating an existing application's content (cover letter, resume, etc.). */
export class UpdateApplicationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(10000)
  coverLetter?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  resumeUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  portfolioUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  expectedSalary?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  screeningAnswers?: Record<string, any>;
}

/** Base DTO fields for scheduling an interview (dateTime + optional notes). */
class ScheduleInterviewBase {
  @ApiProperty()
  @IsString()
  dateTime: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

/** Base DTO fields for sending a job offer (salary + optional message). */
class SendOfferBase {
  @ApiProperty()
  @IsInt()
  salary: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  message?: string;
}

/** Base DTO fields for responding to an offer (ACCEPTED or DECLINED). */
class RespondToOfferBase {
  @ApiProperty({ enum: ['ACCEPTED', 'DECLINED'] })
  @IsString()
  response: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  message?: string;
}

/** Base DTO fields for bulk-updating the status of multiple applications. */
class BulkUpdateStatusBase {
  @ApiProperty({ type: [String] })
  ids: string[];

  @ApiProperty({ enum: ApplicationStatus })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

/** Base DTO fields for filtering/pagination of application listings. */
class ApplicationFiltersBase {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  jobId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  limit?: number;
}

/** DTO for scheduling an interview. */
export class ScheduleInterviewDto extends ScheduleInterviewBase {}
/** DTO for sending a job offer. */
export class SendOfferDto extends SendOfferBase {}
/** DTO for responding to an offer (accept/decline). */
export class RespondToOfferDto extends RespondToOfferBase {}
/** DTO for bulk-updating application statuses. */
export class BulkUpdateStatusDto extends BulkUpdateStatusBase {}
/** DTO for advanced filtered/paginated application search. */
export class ApplicationFiltersDto extends ApplicationFiltersBase {}

/** DTO for updating a single application's status with optional notes. */
export class UpdateApplicationStatusDto {
  @ApiProperty({ enum: ApplicationStatus, enumName: 'ApplicationStatus', example: ApplicationStatus.SHORTLISTED })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @ApiProperty({ required: false, example: 'Strong candidate — schedule interview' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
