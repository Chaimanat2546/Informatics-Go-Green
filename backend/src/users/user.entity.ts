import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  province: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 'user' })
  role: string;

  // === Authentication Provider Fields ===

  @Column({ default: 'local' })
  provider: string; // 'local', 'google', 'facebook'

  @Column({ nullable: true })
  providerId: string; // ID from OAuth provider

  // === Password Reset Fields ===

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date | null;

  // === PDPA Compliance Fields ===

  /**
   * Soft Delete - TypeORM จะไม่ลบจริง แต่จะ set วันที่ลบแทน
   * ใช้ softRemove() และ recover() methods
   */
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  /**
   * วันที่ผู้ใช้ส่งคำขอลบบัญชี
   * ใช้สำหรับนับ grace period (เช่น 30 วัน)
   */
  @Column({ type: 'timestamp', nullable: true })
  deletionRequestedAt: Date | null;

  /**
   * วันที่ข้อมูลถูก anonymize
   * หลัง grace period หมด ข้อมูลจะถูก anonymize
   */
  @Column({ type: 'timestamp', nullable: true })
  anonymizedAt: Date | null;

  // === Timestamps ===

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
