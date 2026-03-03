import { 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsNotEmpty, 
  IsInt, 
  Min,
  IsPositive 
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetWasteMaterialsQueryDto {
  @ApiPropertyOptional({ 
    description: 'Search keyword for name, unit, or category',
    example: 'ขวด'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ 
    description: 'Page number',
    example: 1,
    default: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Number of items per page',
    example: 10,
    default: 10,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}

export class CreateWasteMaterialDto {
  @ApiProperty({ 
    description: 'Name of the waste material',
    example: 'ขวดพลาสติก PET ใส' 
  })
  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกชื่อวัสดุ' })
  name: string;

  @ApiProperty({ 
    description: 'Emission factor value',
    example: 2.1500 
  })
  @IsNumber({}, { message: 'ค่าสัมประสิทธิ์ต้องเป็นตัวเลข' })
  @IsPositive({ message: 'ค่าสัมประสิทธิ์ต้องมากกว่า 0' })
  @IsNotEmpty({ message: 'กรุณากรอกค่าสัมประสิทธิ์' })
  emissionFactor: number;

  @ApiProperty({ 
    description: 'Unit of measurement',
    example: 'PET' 
  })
  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกหน่วย' })
  unit: string;

  @ApiPropertyOptional({ 
    description: 'Image URL (optional)',
    example: 'https://example.com/image.jpg' 
  })
  @IsString()
  @IsOptional()
  meterialImage?: string;

  @ApiProperty({ 
    description: 'Waste category ID',
    example: 1 
  })
  @Type(() => Number)
  @IsInt({ message: 'หมวดหมู่ต้องเป็นตัวเลข' })
  @IsPositive({ message: 'กรุณาเลือกหมวดหมู่' })
  @IsNotEmpty({ message: 'กรุณาเลือกหมวดหมู่' })
  wasteCategoriesId: number;
}

export class UpdateWasteMaterialDto {
  @ApiPropertyOptional({ 
    description: 'Name of the waste material'
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ 
    description: 'Emission factor value'
  })
  @IsNumber()
  @IsPositive({ message: 'ค่าสัมประสิทธิ์ต้องมากกว่า 0' })
  @IsOptional()
  emissionFactor?: number;

  @ApiPropertyOptional({ 
    description: 'Unit of measurement'
  })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ 
    description: 'Image URL'
  })
  @IsString()
  @IsOptional()
  meterialImage?: string;

  @ApiPropertyOptional({ 
    description: 'Waste category ID'
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  wasteCategoriesId?: number;
}