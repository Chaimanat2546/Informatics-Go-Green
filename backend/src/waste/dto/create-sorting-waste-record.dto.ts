import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsNumber,
  IsOptional,
  IsEnum,
} from 'class-validator'; 

export class CreateWasteSortingRecordDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsInt()
  @IsNotEmpty()
  materialId: number;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['scan', 'manual'])
  source: string;
}
