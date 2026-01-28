import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'กรุณากรอกอีเมลที่ถูกต้อง' })
  email: string;

  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่าน' })
  @MinLength(6, { message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' })
  @MaxLength(32, { message: 'รหัสผ่านต้องไม่เกิน 32 ตัวอักษร' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'รหัสผ่านต้องมีตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และตัวเลขอย่างน้อยอย่างละ 1 ตัว',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกชื่อ' })
  @MaxLength(50, { message: 'ชื่อต้องไม่เกิน 50 ตัวอักษร' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกนามสกุล' })
  @MaxLength(50, { message: 'นามสกุลต้องไม่เกิน 50 ตัวอักษร' })
  lastName: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{9,10}$/, {
    message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก',
  })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  province?: string;
}
