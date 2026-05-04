import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { WasteCategoryService } from '../services/waste-category.service';
import { JwtAuthGuard } from '../../auth/guards';
import { AdminGuard } from '../../admin/admin.guard';
import { CreateWasteCategoryDto } from '../dto/waste-category.dto';

@Controller('admin') // ✅ ตรงนี้สำคัญ
@UseGuards(JwtAuthGuard, AdminGuard)
export class WasteCategoryController {
  constructor(private readonly wasteCategoryService: WasteCategoryService) {}

  @Get('waste-categories')
  async findAll() {
    return this.wasteCategoryService.findAll();
  }

  @Get('waste-categories/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wasteCategoryService.findOne(id);
  }

  @Post('waste-categories')
  async create(@Body() createDto: CreateWasteCategoryDto) {
    return this.wasteCategoryService.create(createDto);
  }

  @Delete('waste-categories/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.wasteCategoryService.delete(id);
  }
}
