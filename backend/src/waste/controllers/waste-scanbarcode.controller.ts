import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CreateWasteRecordDto } from '../dto/create-waste-record.dto';
import { WasteScannerService } from '../services/waste-scanbarcode.service';

@Controller('waste')
export class WasteScannerController {
  constructor(private readonly wasteService: WasteScannerService) {}

  @Get('item/:id')
  async getWasteById(@Param('id', ParseIntPipe) id: number) {
    return await this.wasteService.findByWasteId(id);
  }

  @Get('items')
  async getWasteItems(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 6,
    @Query('search') search?: string,
  ) {
    return await this.wasteService.findAllWasteItems(
      Number(page),
      Number(limit),
      search,
    );
  }

  @Get('scan/:barcode')
  async scanBarcode(@Param('barcode', ParseIntPipe) barcode: number) {
    return this.wasteService.findByBarcode(barcode);
  }

  @Post('record')
  async recordWaste(@Body() createWasteRecordDto: CreateWasteRecordDto) {
    return this.wasteService.recordWaste(createWasteRecordDto);
  }
}
