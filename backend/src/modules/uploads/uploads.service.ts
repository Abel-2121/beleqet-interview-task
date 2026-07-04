import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly configured: boolean;

  constructor(private config: ConfigService) {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
      this.configured = true;
      this.logger.log('Cloudinary upload service configured');
    } else {
      this.configured = false;
      this.logger.warn('Cloudinary credentials missing — uploads will fail');
    }
  }

  /** Returns signed upload params for direct client → Cloudinary uploads */
  async generatePresignedUrl(filename: string, contentType: string, folder = 'beleqet') {
    if (!this.configured) {
      throw new InternalServerErrorException('Cloudinary not configured on server');
    }

    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME')!;
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY')!;
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET')!;

    const timestamp = Math.round(Date.now() / 1000);
    const safeFolder = folder.replace(/[^a-zA-Z0-9_/-]/g, '');

    const paramsToSign: Record<string, string | number> = {
      timestamp,
      folder: safeFolder,
    };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

    return {
      uploadUrl,
      presignedUrl: uploadUrl,
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder: safeFolder,
      contentType,
    };
  }
}
