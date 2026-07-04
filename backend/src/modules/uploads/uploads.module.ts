import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';

/** UploadsModule — handles file uploads via Cloudinary signed upload parameters */
@Module({
  providers: [UploadsService],
  controllers: [UploadsController]
})
export class UploadsModule {}
