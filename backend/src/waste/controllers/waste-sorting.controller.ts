import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { WasteSortingService } from '../services/waste-sorting.service';

@Controller('waste')
export class WasteSortingController {
  constructor(private readonly wasteService: WasteSortingService) {}

  @Get('material/:id')
  async getMaterialDetail(@Param('id', ParseIntPipe) id: number) {
    return await this.wasteService.findByMaterialId(id);
  }

  @Post('sorting/record')
  async createRecord(
    @Body('meterialId') materialId: number,
    @Body('weight') weight: number,
    @Body('userId') userId: number,
  ) {
    return await this.wasteService.recordWasteWeight(
      materialId,
      weight,
      userId,
    );
  }

  @Get('waste-materials')
  async getMaterials(
    @Query('page') page: number = 1,
    @Query('category_name') categoryName?: string,
    @Query('material_name') materialName?: string,
  ) {
    return this.wasteService.findMeterialsAll(page, categoryName, materialName);
  }

  @Get('categories')
  async getAllCategories() {
    return this.wasteService.findAllCategories();
  }
}
