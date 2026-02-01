import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  WasteCategory,
  Waste,
  WasteHistory,
  WasteSorting,
  WasteMaterial,
  MaterialGuide,
} from './entities';
import { WasteScannerController } from './controllers/waste-scanbarcode.controller';
import { WasteScannerService } from './services/waste-scanbarcode.service';
import { User } from 'src/users/user.entity';
import { WasteHistoryController } from './controllers/waste-history.controller';
import { WasteHistoryService } from './services/waste-history.service';
import { WasteSortingController } from './controllers/waste-sorting.controller';
import { WasteSortingService } from './services/waste-sorting.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WasteCategory,
      Waste,
      WasteHistory,
      WasteSorting,
      WasteMaterial,
      MaterialGuide,
      User,
    ]),
  ],
  controllers: [
    WasteScannerController,
    WasteHistoryController,
    WasteSortingController,
  ],
  providers: [
    WasteScannerService,
    WasteHistoryService,
    WasteSortingService,
  ],
  exports: [TypeOrmModule],
})
export class WasteModule {}
