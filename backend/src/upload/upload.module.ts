import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadController, UserUploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [ConfigModule],
  controllers: [UploadController, UserUploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
