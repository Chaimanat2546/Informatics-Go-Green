import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Waste } from './waste.entity';
import { User } from '../../users/user.entity';

export enum WasteReactionType {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

@Entity('waste_reactions')
@Unique(['wastesid', 'userid'])
export class WasteReaction {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  wastesid: number;

  @Column({ type: 'uuid' })
  userid: string;

  @Column({
    type: 'enum',
    enum: WasteReactionType,
    enumName: 'waste_reaction_type',
  })
  reaction: WasteReactionType; // 'like' or 'dislike'

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
