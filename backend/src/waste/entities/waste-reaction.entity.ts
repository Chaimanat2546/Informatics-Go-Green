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

@Entity('waste_reactions')
export class WasteReaction {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  wastesid: number;

  @Column({ type: 'varchar' })
  userid: string;

  @Column({ type: 'varchar', length: 10 })
  reaction: string; // 'like' or 'dislike'

  @CreateDateColumn({ type: 'timestamp' })
  create_at: Date;

  // Relations
  @ManyToOne(() => Waste, (waste) => waste.wasteReactions)
  @JoinColumn({ name: 'wastesid' })
  waste: Waste;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userid' })
  user: User;
}
