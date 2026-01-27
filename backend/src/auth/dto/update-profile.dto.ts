import {
  IsString,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'ชื่อต้องไม่เกิน 50 ตัวอักษร' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'นามสกุลต้องไม่เกิน 50 ตัวอักษร' })
  lastName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{9,10}$/, {
    message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก',
  })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;
}

