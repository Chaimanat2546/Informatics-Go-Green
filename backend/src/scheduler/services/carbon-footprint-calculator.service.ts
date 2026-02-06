import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WasteMaterial } from '../../waste/entities/waste-material.entity';

export interface CarbonFootprintInput {
  amount: number; // ปริมาณขยะ
  wasteMaterialId?: number; // ID ของ waste material (ถ้ามี)
  emissionFactor?: number; // ค่า emission factor โดยตรง (ถ้าไม่มี wasteMaterialId)
}

export interface CarbonFootprintResult {
  carbonFootprint: number; // kg CO2e
  amount: number;
  emissionFactor: number;
  unit: string;
}

@Injectable()
export class CarbonFootprintCalculatorService {
  constructor(
    @InjectRepository(WasteMaterial)
    private readonly wasteMaterialRepository: Repository<WasteMaterial>,
  ) {}

  /**
   * คำนวณ Carbon Footprint จาก amount และ emission factor
   * สูตร: Carbon Footprint (kg CO2e) = amount × emission_factor
   *
   * @param amount - ปริมาณขยะ
   * @param emissionFactor - ค่า emission factor
   * @returns Carbon Footprint in kg CO2e
   */
  calculate(amount: number, emissionFactor: number): number {
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    if (emissionFactor < 0) {
      throw new Error('Emission factor cannot be negative');
    }

    const result = amount * emissionFactor;
    return Math.round(result * 1000) / 1000; // Round to 3 decimal places
  }

  /**
   * คำนวณ Carbon Footprint โดยใช้ waste material ID
   *
   * @param amount - ปริมาณขยะ
   * @param wasteMaterialId - ID ของ WasteMaterial entity
   * @returns CarbonFootprintResult
   */
  async calculateByMaterialId(
    amount: number,
    wasteMaterialId: number,
  ): Promise<CarbonFootprintResult> {
    const material = await this.wasteMaterialRepository.findOne({
      where: { id: wasteMaterialId },
    });

    if (!material) {
      throw new Error(`Waste material with ID ${wasteMaterialId} not found`);
    }

    if (
      material.emission_factor === null ||
      material.emission_factor === undefined
    ) {
      throw new Error(
        `Emission factor is not set for material: ${material.name}`,
      );
    }

    const carbonFootprint = this.calculate(amount, material.emission_factor);

    return {
      carbonFootprint,
      amount,
      emissionFactor: material.emission_factor,
      unit: material.unit || 'kg CO2e',
    };
  }

  /**
   * คำนวณ Carbon Footprint สำหรับหลาย items พร้อมกัน
   *
   * @param items - Array of { amount, wasteMaterialId }
   * @returns Total carbon footprint และ breakdown
   */
  async calculateMultiple(
    items: Array<{ amount: number; wasteMaterialId: number }>,
  ): Promise<{
    total: number;
    breakdown: CarbonFootprintResult[];
  }> {
    const breakdown: CarbonFootprintResult[] = [];
    let total = 0;

    for (const item of items) {
      const result = await this.calculateByMaterialId(
        item.amount,
        item.wasteMaterialId,
      );
      breakdown.push(result);
      total += result.carbonFootprint;
    }

    return {
      total: Math.round(total * 1000) / 1000,
      breakdown,
    };
  }

  /**
   * ดึงรายการ WasteMaterial ทั้งหมดพร้อม emission factor
   * สำหรับ display ใน frontend
   */
  async getAllMaterialsWithEmissionFactor(): Promise<
    Array<{
      id: number;
      name: string;
      emissionFactor: number | null;
      unit: string | null;
    }>
  > {
    const materials = await this.wasteMaterialRepository.find({
      select: ['id', 'name', 'emission_factor', 'unit'],
    });

    return materials.map((m) => ({
      id: Number(m.id),
      name: m.name,
      emissionFactor: m.emission_factor,
      unit: m.unit,
    }));
  }
}
