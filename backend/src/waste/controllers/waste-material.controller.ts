import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { WasteMaterialService } from '../services/waste-material.service';
import { UploadService } from '../../upload/upload.service';
import { JwtAuthGuard } from '../../auth/guards';
import { AdminGuard } from '../../admin/admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class WasteMaterialController {
  constructor(
    private wasteMaterialService: WasteMaterialService,
    private uploadService: UploadService,
  ) {}

  @Get('waste-materials')
  async getAllWasteMaterials(@Query() query: any) {
    return this.wasteMaterialService.getAllWasteMaterials(
      query.search,
      query.page,
      query.limit,
    );
  }

  @Get('waste-materials/:id')
  async getWasteMaterialById(@Param('id', ParseIntPipe) id: number) {
    return this.wasteMaterialService.getWasteMaterialById(id);
  }

  @Post('waste-materials/add')
  @UseInterceptors(FileInterceptor('image'))
  async createWasteMaterial(
    @Body() createDto: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imageUrl = '';

    // อัพโหลดรูป (ถ้ามี)
    if (file) {
      const result = await this.uploadService.saveWasteMaterialPicture(file);
      imageUrl = result.url;
    }

    return this.wasteMaterialService.createWasteMaterial({
      ...createDto,
      meterialImage: imageUrl,
    });
  }

  @Put('waste-materials/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updateWasteMaterial(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // ดึงข้อมูลเดิม
    const existingMaterial = await this.wasteMaterialService.getWasteMaterialById(id);

    let imageUrl = existingMaterial.meterial_image;

    // ถ้ามีรูปใหม่
    if (file) {
      // ลบรูปเก่า (ถ้ามี)
      if (existingMaterial.meterial_image) {
        const oldFilename = this.uploadService.extractFilenameFromUrl(
          existingMaterial.meterial_image,
        );
        if (oldFilename) {
          await this.uploadService.deleteWasteMaterialPicture(oldFilename);
        }
      }

      // อัพโหลดรูปใหม่
      const result = await this.uploadService.saveWasteMaterialPicture(file);
      imageUrl = result.url;
    }

    return this.wasteMaterialService.updateWasteMaterial(id, {
      ...updateDto,
      meterialImage: imageUrl,
    });
  }

  @Delete('waste-materials/:id')
  async deleteWasteMaterial(@Param('id', ParseIntPipe) id: number) {
    // ดึงข้อมูลเดิม
    const material = await this.wasteMaterialService.getWasteMaterialById(id);

    // ลบรูป (ถ้ามี)
    if (material.meterial_image) {
      const filename = this.uploadService.extractFilenameFromUrl(
        material.meterial_image,
      );
      if (filename) {
        await this.uploadService.deleteWasteMaterialPicture(filename);
      }
    }

    // ลบข้อมูล
    await this.wasteMaterialService.deleteWasteMaterial(id);
    
    return { message: 'ลบข้อมูลสำเร็จ' };
  }
}