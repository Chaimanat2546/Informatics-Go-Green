import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { WasteManageService } from '../services/waste-manage.service';
import { CreateWasteWithGuidesDto } from '../dto/create-waste-with-guides.dto';
import { UploadService } from '../../upload/upload.service';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp',
];

@Controller('waste')
export class WasteManageController {
  constructor(
    private readonly wasteManageService: WasteManageService,
    private readonly uploadService: UploadService,
  ) {}

  /**
   * POST /waste/with-guides
   * สร้างข้อมูลขยะพร้อมวิธีแยกส่วนประกอบ
   *
   * รับ body เป็น multipart/form-data:
   * - data (string/JSON): CreateWasteWithGuidesDto
   * - files (File[]): รูปภาพทั้งหมด (waste_image + guide_image ของแต่ละชิ้นส่วน)
   *
   * Convention สำหรับไฟล์ภาพ:
   * - ไฟล์แรก (index 0) = waste_image (รูปขยะหลัก)
   * - ไฟล์ถัดไป (index 1, 2, ...) = guide_image ตามลำดับ materialGuides
   */
  @Post('with-guides')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: memoryStorage(),
      fileFilter: (req, file, callback) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(
              'ประเภทไฟล์ไม่ถูกต้อง (รองรับ JPEG, PNG, WEBP เท่านั้น)',
            ),
            false,
          );
        }
      },
    }),
  )
  async createWasteWithGuides(
    @Body('data') rawData: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // Parse JSON data from form
    let dto: CreateWasteWithGuidesDto;
    try {
      dto = JSON.parse(rawData) as CreateWasteWithGuidesDto;
    } catch {
      throw new BadRequestException('ข้อมูล JSON ไม่ถูกต้อง');
    }

    // Upload images if provided
    if (files && files.length > 0) {
      // First file => waste_image
      const wasteImageResult =
        await this.uploadService.saveWasteMaterialPicture(files[0]);
      dto.waste_image = wasteImageResult.url;

      // Remaining files => guide_image for each materialGuide in order
      for (let i = 1; i < files.length; i++) {
        const guideIndex = i - 1;
        if (dto.materialGuides && dto.materialGuides[guideIndex]) {
          const guideImageResult =
            await this.uploadService.saveWasteMaterialPicture(files[i]);
          dto.materialGuides[guideIndex].guide_image = guideImageResult.url;
        }
      }
    }

    return this.wasteManageService.createWasteWithGuides(dto);
  }

  /**
   * POST /waste/with-guides/json
   * สร้างข้อมูลขยะพร้อมวิธีแยกส่วนประกอบ (JSON only, ไม่มีไฟล์)
   * ใช้เมื่อส่ง URL ของรูปภาพมาโดยตรง
   */
  @Post('with-guides/json')
  async createWasteWithGuidesJson(@Body() dto: CreateWasteWithGuidesDto) {
    return this.wasteManageService.createWasteWithGuides(dto);
  }
}
