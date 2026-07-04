import { Module } from '@nestjs/common';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';

/** Module that wires up CV generation endpoints and service */
@Module({
  controllers: [CvController],
  providers: [CvService],
})
export class CvModule {}
