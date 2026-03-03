import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  WasteCategory,
  Waste,
  WasteHistory,
  WasteSorting,
  WasteMaterial,
  MaterialGuide,
  WasteCalculateLog,
} from './entities';
import { WasteScannerController } from './controllers/waste-scanbarcode.controller';
import { WasteScannerService } from './services/waste-scanbarcode.service';
import { User } from 'src/users/user.entity';
import { WasteHistoryController } from './controllers/waste-history.controller';
import { WasteHistoryService } from './services/waste-history.service';
import { WasteSortingController } from './controllers/waste-sorting.controller';
import { WasteSortingService } from './services/waste-sorting.service';
import { StatisticsService } from './services/statistics.service';
import { StatisticsController } from './controllers/statistics.controller';
import { WasteCategoryController } from './controllers/waste-category.controller';
import { WasteCategoryService } from './services/waste-category.service';
import { WasteMaterialController } from './controllers/waste-material.controller';
import { WasteMaterialService } from './services/waste-material.service';
import { UploadModule } from '../upload/upload.module';

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
      WasteCalculateLog,
    ]),
    UploadModule,
  ],
  controllers: [
    WasteScannerController,
    WasteHistoryController,
    WasteCategoryController,
    WasteMaterialController,  
    WasteSortingController,
    StatisticsController,
  ],
  providers: [
    WasteScannerService,
    WasteHistoryService,
    WasteSortingService,
    StatisticsService,
    WasteCategoryService,
    WasteMaterialService,
  ],
  exports: [TypeOrmModule],
})
export class WasteModule {}