import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/** DTO for requesting a Cloudinary presigned upload URL (filename, contentType, optional folder) */
export class PresignedUrlDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;

  @IsString()
  @IsOptional()
  folder?: string;
}

/** Handles HTTP routes for generating signed Cloudinary upload URLs */
@ApiTags('uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  /** Generates and returns signed Cloudinary upload parameters for direct client upload */
  @Post('presigned-url')
  @ApiOperation({ summary: 'Get Cloudinary signed upload params for a file' })
  async getPresignedUrl(@Body() body: PresignedUrlDto) {
    return this.uploadsService.generatePresignedUrl(
      body.filename, 
      body.contentType, 
      body.folder || 'misc'
    );
  }
}
