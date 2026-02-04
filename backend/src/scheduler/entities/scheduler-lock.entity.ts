import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('scheduler_locks')
export class SchedulerLock {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'boolean', default: false })
  is_locked: boolean;

  @Column({ type: 'timestamp', nullable: true })
  locked_at: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  locked_by: string;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
