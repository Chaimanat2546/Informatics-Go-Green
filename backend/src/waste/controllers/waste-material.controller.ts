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

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class WasteMaterialController {
  constructor(
    private wasteMaterialService: WasteMaterialService,
    private uploadService: UploadService,
  ) {}

  @Get('waste-materials')
  async getAllWasteMaterials(
    @Query() query: { search?: string; page?: number; limit?: number },
  ) {
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

  // Bug 5 fixed: was /waste-materials/add, now proper POST /waste-materials
  // Bug 1 fixed: removed FileInterceptor — frontend uploads image separately via /upload/waste-material-picture
  @Post('waste-materials')
  async createWasteMaterial(@Body() createDto: CreateWasteMaterialDto) {
    return this.wasteMaterialService.createWasteMaterial(createDto);
  }

  // Bug 1 fixed: removed FileInterceptor — image URL comes from DTO directly
  @Put('waste-materials/:id')
  async updateWasteMaterial(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateWasteMaterialDto,
  ) {
    const existingMaterial =
      await this.wasteMaterialService.getWasteMaterialById(id);

    // Delete old image if a new URL is provided and differs from the existing one
    if (
      updateDto.materialImage !== undefined &&
      existingMaterial.material_image &&
      existingMaterial.material_image !== updateDto.materialImage
    ) {
      const oldFilename = this.uploadService.extractFilenameFromUrl(
        existingMaterial.material_image,
      );
      if (oldFilename) {
        await this.uploadService.deleteWasteMaterialPicture(oldFilename);
      }
    }

    return this.wasteMaterialService.updateWasteMaterial(id, updateDto);
  }

  @Delete('waste-materials/:id')
  async deleteWasteMaterial(@Param('id', ParseIntPipe) id: number) {
    const material = await this.wasteMaterialService.getWasteMaterialById(id);

    // Bug 3 fixed: delete DB record first, then delete file
    // This ensures the record is always cleaned up even if file deletion fails
    await this.wasteMaterialService.deleteWasteMaterial(id);

    if (material.material_image) {
      const filename = this.uploadService.extractFilenameFromUrl(
        material.material_image,
      );
      if (filename) {
        await this.uploadService.deleteWasteMaterialPicture(filename);
      }
    }

    return { message: 'ลบข้อมูลสำเร็จ' };
  }
}
