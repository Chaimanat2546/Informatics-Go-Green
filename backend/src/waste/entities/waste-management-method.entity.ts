import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { WasteCalculateLog } from './waste-calculate-log.entity';

@Entity('waste_management_methods')
export class WasteManagementMethod {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'float', nullable: true })
  transport_km: number;

  @Column({ type: 'float', nullable: true })
  transport_co2e_per_km: number;

  @OneToMany(() => WasteCalculateLog, (log) => log.wasteManagementMethod)
  wasteCalculateLogs: WasteCalculateLog[];
}
