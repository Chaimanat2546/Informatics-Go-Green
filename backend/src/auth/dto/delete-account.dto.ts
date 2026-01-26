import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteAccountDto {
  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่านเพื่อยืนยันการลบบัญชี' })
  @IsString()
  password: string;
}
