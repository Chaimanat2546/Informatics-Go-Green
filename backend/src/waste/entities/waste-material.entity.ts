import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { WasteCategory } from './waste-category.entity';
import { MaterialGuide } from './material-guide.entity';
import { WasteHistory } from './waste-history.entity';

@Entity('waste_meterial')
export class WasteMaterial {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'float', nullable: true })
  emission_factor: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  unit: string;

  @CreateDateColumn({ type: 'date' })
  created_at: Date;

  @UpdateDateColumn({ type: 'date' })
  updated_at: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  meterial_image: string;

  @Column({ type: 'bigint', nullable: true })
  waste_categoriesid: number;

  // Relations
  @ManyToOne(() => WasteCategory, (category) => category.materials)
  @JoinColumn({ name: 'waste_categoriesid' })
  wasteCategory: WasteCategory;

  @OneToMany(() => MaterialGuide, (guide) => guide.wasteMaterial)
  materialGuides: MaterialGuide[];

  @OneToMany(() => WasteHistory, (history) => history.wasteMaterial)
  wasteHistories: WasteHistory[];
}
