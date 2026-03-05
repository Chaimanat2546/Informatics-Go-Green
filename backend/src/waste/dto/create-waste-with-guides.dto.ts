import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMaterialGuideDto {
  @IsNumber()
  @IsNotEmpty()
  waste_meterialid: number;

  @IsString()
  @IsOptional()
  recommendation?: string;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  guide_image?: string;
}

export class CreateWasteWithGuidesDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  wasteCategoryId: number;

  @IsNumber()
  @IsOptional()
  barcode?: number;

  @IsString()
  @IsOptional()
  waste_image?: string;

  @IsNumber()
  @IsOptional()
  userid?: number;

  @IsArray()
  @ArrayMinSize(1, { message: 'ต้องมีส่วนประกอบวิธีแยกขยะอย่างน้อย 1 รายการ' })
  @ValidateNested({ each: true })
  @Type(() => CreateMaterialGuideDto)
  materialGuides: CreateMaterialGuideDto[];
}
