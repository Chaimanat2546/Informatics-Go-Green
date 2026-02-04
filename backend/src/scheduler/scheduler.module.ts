import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulerLock } from './entities/scheduler-lock.entity';
import { SchedulerSettings } from './entities/scheduler-settings.entity';
import { CarbonFootprintSchedulerService } from './services/carbon-footprint-scheduler.service';
import { CarbonFootprintCalculatorService } from './services/carbon-footprint-calculator.service';
import { SchedulerSettingsService } from './services/scheduler-settings.service';
import { SchedulerController } from './controllers/scheduler.controller';
import { WasteHistory } from '../waste/entities/waste-history.entity';
import { WasteMaterial } from '../waste/entities/waste-material.entity';
import { WasteManagementMethod } from '../waste/entities/waste-management-method.entity';
import { WasteCalculateLog } from '../waste/entities/waste-calculate-log.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      SchedulerLock,
      SchedulerSettings,
      WasteHistory,
      WasteMaterial,
      WasteManagementMethod,
      WasteCalculateLog,
    ]),
  ],
  controllers: [SchedulerController],
  providers: [CarbonFootprintSchedulerService, CarbonFootprintCalculatorService, SchedulerSettingsService],
  exports: [CarbonFootprintSchedulerService, CarbonFootprintCalculatorService, SchedulerSettingsService],
})
export class SchedulerModule {}



