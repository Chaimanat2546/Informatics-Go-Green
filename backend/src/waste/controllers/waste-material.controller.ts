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
} from '@nestjs/common';
import { WasteMaterialService } from '../services/waste-material.service';
import { UploadService } from '../../upload/upload.service';
import { JwtAuthGuard } from '../../auth/guards';
import { AdminGuard } from '../../admin/admin.guard';
import {
  CreateWasteMaterialDto,
  UpdateWasteMaterialDto,
} from '../dto/waste-material.dto';

@Controller('admin/waste-materials')
@UseGuards(JwtAuthGuard, AdminGuard)
export class WasteMaterialController {
  constructor(
    private wasteMaterialService: WasteMaterialService,
    private uploadService: UploadService,
  ) {}

  @Get()
  async getAllWasteMaterials(
    @Query() query: { search?: string; page?: number; limit?: number },
  ) {
    return this.wasteMaterialService.getAllWasteMaterials(
      query.search,
      query.page || 1,
      query.limit || 10,
    );
  }

  @Get(':id')
  async getWasteMaterialById(@Param('id', ParseIntPipe) id: number) {
    return this.wasteMaterialService.getWasteMaterialById(id);
  }

  @Post()
  async createWasteMaterial(@Body() createDto: CreateWasteMaterialDto) {
    return this.wasteMaterialService.createWasteMaterial(createDto);
  }

  @Put(':id')
  async updateWasteMaterial(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateWasteMaterialDto,
  ) {
    // ถ้ามีรูปใหม่ ลบรูปเก่าก่อน
    if (updateDto.materialImage) {
      const existing = await this.wasteMaterialService.getWasteMaterialById(id);
      if (
        existing.materialImage &&
        existing.materialImage !== updateDto.materialImage
      ) {
        const oldFilename = this.uploadService.extractFilenameFromUrl(
          existing.materialImage,
        );
        if (oldFilename) {
          await this.uploadService.deleteWasteMaterialPicture(oldFilename);
        }
      }
    }

    return this.wasteMaterialService.updateWasteMaterial(id, updateDto);
  }

  @Delete(':id')
  async deleteWasteMaterial(@Param('id', ParseIntPipe) id: number) {
    return this.wasteMaterialService.deleteWasteMaterialWithImage(
      id,
      async (filename) => {
        await this.uploadService.deleteWasteMaterialPicture(filename);
      },
    );
  }
}
