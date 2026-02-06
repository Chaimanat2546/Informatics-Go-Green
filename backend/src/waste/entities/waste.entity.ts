import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { WasteCategory } from './waste-category.entity';
import { User } from '../../users/user.entity';
import { WasteHistory } from './waste-history.entity';
import { WasteSorting } from './waste-sorting.entity';
import { MaterialGuide } from './material-guide.entity';

@Entity('wastes')
export class Waste {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  waste_image: string;

  @Column({ type: 'bigint', nullable: true })
  barcode: number;

  @CreateDateColumn({ type: 'date' })
  create_at: Date;

  @Column({ type: 'bigint', nullable: true })
  waste_categoriesid: number;

  @Column({ type: 'bigint', nullable: true })
  userid: number;

  // Relations
  @ManyToOne(() => WasteCategory, (category) => category.wastes)
  @JoinColumn({ name: 'waste_categoriesid' })
  wasteCategory: WasteCategory;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userid' })
  user: User;

  @OneToMany(() => WasteHistory, (history) => history.waste)
  wasteHistories: WasteHistory[];

  @OneToMany(() => WasteSorting, (sorting) => sorting.waste)
  wasteSortings: WasteSorting[];

  @OneToMany(() => MaterialGuide, (guide) => guide.waste)
  materialGuides: MaterialGuide[];
}
