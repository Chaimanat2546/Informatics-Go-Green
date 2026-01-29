import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WasteMaterial } from './waste-material.entity';
import { Waste } from './waste.entity';

@Entity('material_guides')
export class MaterialGuide {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  guide_image: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  recommendation: string;

  @CreateDateColumn({ type: 'date' })
  created_at: Date;

  @UpdateDateColumn({ type: 'date' })
  updated_at: Date;

  @Column({ type: 'bigint', nullable: true })
  waste_meterialid: number;

  @Column({ type: 'bigint', nullable: true })
  wastesid: number;

  // Relations
  @ManyToOne(() => WasteMaterial, (material) => material.materialGuides)
  @JoinColumn({ name: 'waste_meterialid' })
  wasteMaterial: WasteMaterial;

  @ManyToOne(() => Waste, (waste) => waste.materialGuides)
  @JoinColumn({ name: 'wastesid' })
  waste: Waste;
}
