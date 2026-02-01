import { IsString, IsNotEmpty, IsInt, Min, IsNumber, IsOptional, IsEnum } from 'class-validator'; // <--- Import มาก่อน

export class CreateWasteRecordDto {
  @IsString()     
  @IsNotEmpty()    
  userId: string;

  @IsInt()         
  @IsNotEmpty()
  wasteId: number;

  @IsNumber()
  @IsOptional() 
  amount?: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['scan', 'manual']) 
  source: string;
}