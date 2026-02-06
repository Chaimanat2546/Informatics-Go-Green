import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่านปัจจุบัน' })
  @IsString()
  currentPassword: string;

  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่านใหม่' })
  @MinLength(6, { message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' })
  @MaxLength(32, { message: 'รหัสผ่านใหม่ต้องไม่เกิน 32 ตัวอักษร' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'รหัสผ่านใหม่ต้องมีตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และตัวเลข',
  })
  newPassword: string;
}
