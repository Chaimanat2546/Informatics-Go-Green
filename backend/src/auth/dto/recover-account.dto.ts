import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class RecoverAccountDto {
  @IsEmail({}, { message: 'กรุณาระบุอีเมลที่ถูกต้อง' })
  email: string;

  @IsNotEmpty({ message: 'กรุณาระบุรหัสผ่านใหม่' })
  @MinLength(8, { message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'รหัสผ่านต้องมีตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และตัวเลข',
  })
  password: string;
}

export class CheckRecoverableDto {
  @IsEmail({}, { message: 'กรุณาระบุอีเมลที่ถูกต้อง' })
  email: string;
}
