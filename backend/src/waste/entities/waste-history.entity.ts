import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Waste } from './waste.entity';
import { User } from '../../users/user.entity';
import { WasteMaterial } from './waste-material.entity';

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
}
