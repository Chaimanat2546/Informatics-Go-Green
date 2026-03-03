import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards';
import { AdminGuard } from '../admin/admin.guard';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

@Controller('admin/upload')
@UseGuards(JwtAuthGuard, AdminGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('profile-picture')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, callback) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(
              `ประเภทไฟล์ไม่ถูกต้อง (รองรับ JPEG, PNG, GIF, WEBP เท่านั้น)`,
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadProfilePicture(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('กรุณาเลือกไฟล์รูปภาพ');
    }

    const result = await this.uploadService.saveProfilePicture(file);
    return {
      message: 'อัปโหลดรูปโปรไฟล์สำเร็จ',
      ...result,
    };
  }

  @Post('waste-material-picture')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, callback) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(
              `ประเภทไฟล์ไม่ถูกต้อง (รองรับ JPEG, PNG, GIF, WEBP เท่านั้น)`,
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadWasteMaterialPicture(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('กรุณาเลือกไฟล์รูปภาพ');
    }

    const result = await this.uploadService.saveWasteMaterialPicture(file);
    return {
      message: 'อัปโหลดรูป Waste Material สำเร็จ',
      ...result,
    };
  }
}
