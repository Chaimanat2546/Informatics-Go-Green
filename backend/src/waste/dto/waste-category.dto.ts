import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWasteCategoryDto {
  @ApiProperty({ 
    description: 'Category name',
    example: 'พลาสติก',
    minLength: 1,
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกชื่อหมวดหมู่' })
  @MinLength(1, { message: 'ชื่อหมวดหมู่ต้องมีอย่างน้อย 1 ตัวอักษร' })
  @MaxLength(255, { message: 'ชื่อหมวดหมู่ต้องไม่เกิน 255 ตัวอักษร' })
  name: string;
}
