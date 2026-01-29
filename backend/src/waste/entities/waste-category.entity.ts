import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Waste } from './waste.entity';
import { WasteMaterial } from './waste-material.entity';

@Entity('waste_categories')
export class WasteCategory {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @CreateDateColumn({ type: 'date' })
  created_at: Date;

  @UpdateDateColumn({ type: 'date' })
  updated_at: Date;

  // Relations
  @OneToMany(() => Waste, (waste) => waste.wasteCategory)
  wastes: Waste[];

  @OneToMany(() => WasteMaterial, (material) => material.wasteCategory)
  materials: WasteMaterial[];
}
