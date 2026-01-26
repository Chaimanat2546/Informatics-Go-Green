import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ChangeEmailDto {
  @IsEmail({}, { message: 'กรุณากรอกอีเมลที่ถูกต้อง' })
  newEmail: string;

  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่าน' })
  @IsString()
  password: string;
}
