import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Waste } from './waste.entity';
import { User } from '../../users/user.entity';
import { WasteMaterial } from './waste-material.entity';
import { WasteCalculateLog } from './waste-calculate-log.entity';

@Entity('waste_history')
export class WasteHistory {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'float', nullable: true })
  amount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  record_type: string;

  @CreateDateColumn({ type: 'timestamp' })
  create_at: Date;

  @Column({ type: 'bigint', nullable: true })
  waste_meterialid: number;

  @Column({ type: 'bigint', nullable: true })
  wastesid: number | null;

  @Column({ type: 'bigint', nullable: true })
  userid: number;

  // Carbon Footprint Calculation Fields
  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  calculation_status: string;

  @Column({ type: 'float', nullable: true })
  carbon_footprint: number;

  @Column({ type: 'int', default: 0 })
  retry_count: number;

  @Column({ type: 'timestamp', nullable: true })
  last_calculation_attempt: Date;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  // Relations
  @ManyToOne(() => Waste, (waste) => waste.wasteHistories)
  @JoinColumn({ name: 'wastesid' })
  waste: Waste;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userid' })
  user: User;

  @ManyToOne(() => WasteMaterial, (material) => material.wasteHistories)
  @JoinColumn({ name: 'waste_meterialid' })
  wasteMaterial: WasteMaterial;

  @OneToMany(() => WasteCalculateLog, (log) => log.wasteHistory)
  wasteCalculateLogs: WasteCalculateLog[];
}
