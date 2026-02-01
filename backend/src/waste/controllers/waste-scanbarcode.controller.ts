import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CreateWasteRecordDto } from '../dto/create-waste-record.dto';
import { WasteScannerService } from '../services/waste-scanbarcode.service';

@Controller('waste')
export class WasteScannerController {
  constructor(private readonly wasteService: WasteScannerService) {}

  @Get('scan/:barcode')
  async scanBarcode(@Param('barcode', ParseIntPipe) barcode: number) {
    return this.wasteService.findByBarcode(barcode);
  }

  @Post('record')
  async recordWaste(@Body() createWasteRecordDto: CreateWasteRecordDto) {
    return this.wasteService.recordWaste(createWasteRecordDto);
  }
}
