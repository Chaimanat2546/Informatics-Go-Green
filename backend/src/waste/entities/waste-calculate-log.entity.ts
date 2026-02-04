import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WasteHistory } from './waste-history.entity';
import { WasteManagementMethod } from './waste-management-method.entity';

@Entity('waste_calculate_logs')
export class WasteCalculateLog {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  create_at: Date;

  @Column({ type: 'bigint', nullable: true })
  waste_historyid: number;

  @Column({ type: 'int', nullable: true })
  waste_management_methodid: number;

  // Calculation result fields
  @Column({ type: 'float', nullable: true })
  amount: number;

  @Column({ type: 'float', nullable: true })
  material_emission: number; // amount × emission_factor

  @Column({ type: 'float', nullable: true })
  transport_emission: number; // transport_km × transport_co2e_per_km

  @Column({ type: 'float', nullable: true })
  total_carbon_footprint: number; // material_emission + transport_emission

  // Relations
  @ManyToOne(() => WasteHistory, (history) => history.wasteCalculateLogs)
  @JoinColumn({ name: 'waste_historyid' })
  wasteHistory: WasteHistory;

  @ManyToOne(() => WasteManagementMethod, (method) => method.wasteCalculateLogs)
  @JoinColumn({ name: 'waste_management_methodid' })
  wasteManagementMethod: WasteManagementMethod;
}


