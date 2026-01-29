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

@Entity('waste_history')
export class WasteHistory {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'int' })
  amount: number;

  @CreateDateColumn({ type: 'date' })
  create_at: Date;

  @Column({ type: 'bigint', nullable: true })
  wastesid: number;

  @Column({ type: 'bigint', nullable: true })
  userid: number;

  // Relations
  @ManyToOne(() => Waste, (waste) => waste.wasteHistories)
  @JoinColumn({ name: 'wastesid' })
  waste: Waste;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userid' })
  user: User;
}
