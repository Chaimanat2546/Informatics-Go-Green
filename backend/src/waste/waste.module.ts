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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WasteCategory,
      Waste,
      WasteHistory,
      WasteSorting,
      WasteMaterial,
      MaterialGuide,
    ]),
  ],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class WasteModule {}
