import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Waste } from './waste.entity';

@Entity('waste_sorting')
export class WasteSorting {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @CreateDateColumn({ type: 'date' })
  created_at: Date;

  @UpdateDateColumn({ type: 'date' })
  updated_at: Date;

  @Column({ type: 'bigint', nullable: true })
  wastesid: number;

  // Relations
  @ManyToOne(() => Waste, (waste) => waste.wasteSortings)
  @JoinColumn({ name: 'wastesid' })
  waste: Waste;
}
