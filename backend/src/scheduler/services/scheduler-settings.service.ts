import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchedulerSettings } from '../entities/scheduler-settings.entity';
import { WasteMaterial } from '../../waste/entities/waste-material.entity';
import { WasteManagementMethod } from '../../waste/entities/waste-management-method.entity';

export interface SettingDto {
  key: string;
  value: string;
  label: string;
  description: string;
  type: string;
}

// Default settings (only user-editable settings)
const DEFAULT_SETTINGS: SettingDto[] = [
  {
    key: 'cron_time',
    value: '02:00',
    label: 'เวลาคำนวณอัตโนมัติ',
    description: 'เวลาที่ระบบจะคำนวณ Carbon Footprint อัตโนมัติ (รูปแบบ HH:mm)',
    type: 'time',
  },
  {
    key: 'auto_calculate_enabled',
    value: 'true',
    label: 'เปิดใช้งานการคำนวณอัตโนมัติ',
    description: 'เปิด/ปิดการคำนวณอัตโนมัติรายวัน',
    type: 'boolean',
  },
  {
    key: 'default_management_method_id',
    value: '',
    label: 'วิธีการจัดการขยะที่ใช้คำนวณ',
    description: 'เลือกวิธีการจัดการขยะที่จะใช้คำนวณ Transport Emission',
    type: 'select',
  },
];

@Injectable()
export class SchedulerSettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(SchedulerSettings)
    private readonly settingsRepository: Repository<SchedulerSettings>,
    @InjectRepository(WasteMaterial)
    private readonly wasteMaterialRepository: Repository<WasteMaterial>,
    @InjectRepository(WasteManagementMethod)
    private readonly wasteManagementMethodRepository: Repository<WasteManagementMethod>,
  ) {}

  async onModuleInit(): Promise<void> {
    // Initialize default settings if not exists
    for (const setting of DEFAULT_SETTINGS) {
      const existing = await this.settingsRepository.findOne({
        where: { key: setting.key },
      });

      if (!existing) {
        await this.settingsRepository.save({
          key: setting.key,
          value: setting.value,
          label: setting.label,
          description: setting.description,
          type: setting.type,
        });
      }
    }
  }

  // Keys that should be displayed in UI
  private readonly allowedSettingKeys = [
    'cron_time',
    'auto_calculate_enabled',
    'default_management_method_id',
  ];

  /**
   * Get all settings (only user-editable ones)
   */
  async getAllSettings(): Promise<SchedulerSettings[]> {
    const allSettings = await this.settingsRepository.find({
      order: { key: 'ASC' },
    });
    // Filter to only return allowed settings
    return allSettings.filter((s) => this.allowedSettingKeys.includes(s.key));
  }

  /**
   * Get a single setting by key
   */
  async getSetting(key: string): Promise<string | null> {
    const setting = await this.settingsRepository.findOne({
      where: { key },
    });
    return setting?.value || null;
  }

  /**
   * Get setting as number
   */
  async getSettingAsNumber(key: string, defaultValue: number): Promise<number> {
    const value = await this.getSetting(key);
    if (value === null) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Get setting as boolean
   */
  async getSettingAsBoolean(
    key: string,
    defaultValue: boolean,
  ): Promise<boolean> {
    const value = await this.getSetting(key);
    if (value === null) return defaultValue;
    return value === 'true';
  }

  /**
   * Update a setting
   */
  async updateSetting(
    key: string,
    value: string,
  ): Promise<SchedulerSettings | null> {
    const setting = await this.settingsRepository.findOne({
      where: { key },
    });

    if (!setting) {
      return null;
    }

    setting.value = value;
    return this.settingsRepository.save(setting);
  }

  /**
   * Update multiple settings
   */
  async updateSettings(
    updates: Array<{ key: string; value: string }>,
  ): Promise<void> {
    for (const update of updates) {
      await this.updateSetting(update.key, update.value);
    }
  }

  // =============================================
  // Emission Factor Management
  // =============================================

  /**
   * Get all waste materials with emission factors
   */
  async getAllWasteMaterials(): Promise<WasteMaterial[]> {
    return this.wasteMaterialRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Update emission factor for a waste material
   */
  async updateEmissionFactor(
    materialId: number,
    emissionFactor: number,
    unit?: string,
  ): Promise<WasteMaterial | null> {
    const material = await this.wasteMaterialRepository.findOne({
      where: { id: materialId },
    });

    if (!material) {
      return null;
    }

    material.emission_factor = emissionFactor;
    if (unit) {
      material.unit = unit;
    }

    return this.wasteMaterialRepository.save(material);
  }

  /**
   * Get current cron expression based on settings
   */
  async getCronExpression(): Promise<string> {
    const cronTime = await this.getSetting('cron_time');
    if (cronTime) {
      const [hour, minute] = cronTime.split(':').map(Number);
      return `${minute || 0} ${hour || 2} * * *`;
    }
    return '0 2 * * *'; // Default: 02:00
  }

  // =============================================
  // Waste Management Methods CRUD
  // =============================================

  /**
   * Get all waste management methods
   */
  async getAllWasteManagementMethods(): Promise<WasteManagementMethod[]> {
    return this.wasteManagementMethodRepository.find({
      order: { id: 'ASC' },
    });
  }

  /**
   * Create a new waste management method
   */
  async createWasteManagementMethod(data: {
    name: string;
    process_type?: number;
    transport_km?: number;
    transport_co2e_per_km?: number;
  }): Promise<WasteManagementMethod> {
    const method = this.wasteManagementMethodRepository.create(data);
    return this.wasteManagementMethodRepository.save(method);
  }

  /**
   * Update a waste management method
   */
  async updateWasteManagementMethod(
    id: number,
    data: {
      name?: string;
      process_type?: number;
      transport_km?: number;
      transport_co2e_per_km?: number;
    },
  ): Promise<WasteManagementMethod | null> {
    const method = await this.wasteManagementMethodRepository.findOne({
      where: { id },
    });

    if (!method) {
      return null;
    }

    if (data.name !== undefined) method.name = data.name;
    if (data.transport_km !== undefined)
      method.transport_km = data.transport_km;
    if (data.transport_co2e_per_km !== undefined)
      method.transport_co2e_per_km = data.transport_co2e_per_km;

    return this.wasteManagementMethodRepository.save(method);
  }

  /**
   * Delete a waste management method
   */
  async deleteWasteManagementMethod(id: number): Promise<boolean> {
    const result = await this.wasteManagementMethodRepository.delete(id);
    return (result.affected || 0) > 0;
  }
}
