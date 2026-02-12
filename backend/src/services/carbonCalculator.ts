/**
 * Carbon Footprint Calculation Service
 * Fixes: Support for waste_sorting (scanned trash with multiple materials)
 * Author: KoongBot for พูห์พูห์'s FYP
 * Version: 4.0 (Fixed: Unit mismatch, Type checking, Material key mapping, Logger, Validation)
 */

import { Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import Decimal from 'decimal.js';
import { WasteMaterial } from '../waste/entities/waste-material.entity';
import { WasteSorting } from '../waste/entities/waste-sorting.entity';
import { MaterialGuide } from '../waste/entities/material-guide.entity';
import { WasteHistory } from '../waste/entities/waste-history.entity';

// Type definitions
interface TrashItem {
  id?: number | string;
  weight: number;
  waste_sorting?:
    | Record<string, number>
    | Array<{ name: string; ratio: number }>
    | WasteSortingArrayItem[];
  type?: string;
  emission_factor?: number;
}

interface WasteSortingArrayItem {
  name?: string;
  material?: string;
  ratio?: number;
  percentage?: number;
  amount?: number;
}

interface MaterialBreakdown {
  ratio: number;
  weightGrams: number;
  weightKg: number;
  emissionFactor: number;
  carbon: number;
}

interface CalculationResult {
  carbon_footprint: number;
  breakdown: Record<string, MaterialBreakdown>;
  method: 'waste_sorting' | 'single_type';
  weightGrams?: number;
  totalRatio?: number;
}

interface WasteHistoryRecord {
  trash_id: number | string;
  carbon_footprint: number;
  calculation_method: string;
  breakdown: string;
  weight_grams: number;
  calculated_at: string;
}

interface ErrorRecord {
  trash_id: number | string;
  error: string;
}

interface DailyCalculationSummary {
  results: WasteHistoryRecord[];
  errors: ErrorRecord[];
  logs: string[];
  summary: {
    total: number;
    success: number;
    failed: number;
    duration: number;
  };
}

export class CarbonFootprintCalculator {
  private entityManager: EntityManager;
  private emissionFactors: Map<string, number>;
  private materialIdMap: Map<number, number>; // id -> emission factor
  private wasteSortingMap: Map<string, number>; // name (lowercase) -> waste_sorting_id
  private materialGuideMap: Map<number, number>; // waste_sorting_id -> waste_material_id
  private debugLogs: string[];
  private maxLogs: number; // Fix #1: Memory leak prevention
  private logger: Logger;

  constructor(
    entityManager: EntityManager,
    maxLogs: number = 1000,
    logger?: Logger,
  ) {
    this.entityManager = entityManager;
    this.emissionFactors = new Map();
    this.materialIdMap = new Map();
    this.wasteSortingMap = new Map();
    this.materialGuideMap = new Map();
    this.debugLogs = [];
    this.maxLogs = maxLogs; // Limit logs to prevent memory leak
    this.logger = logger || new Logger(CarbonFootprintCalculator.name);
  }

  /**
   * Load Emission Factors from Database (TypeORM)
   * Fix: Use material_guides lookup chain:
   * materialName -> waste_sorting_id -> waste_material_id -> emission_factor
   */
  async loadEmissionFactors(): Promise<void> {
    this.log('🔄 Loading emission factors from database...');

    try {
      // Load all three entities for the lookup chain
      const [wasteSortings, materialGuides, wasteMaterials] = await Promise.all(
        [
          this.entityManager.find(WasteSorting),
          this.entityManager.find(MaterialGuide),
          this.entityManager.find(WasteMaterial),
        ],
      );

      // Clear all maps
      this.emissionFactors.clear();
      this.materialIdMap.clear();
      this.wasteSortingMap.clear();
      this.materialGuideMap.clear();

      // Build wasteSortingMap: name (lowercase) -> id
      for (const sorting of wasteSortings) {
        if (sorting.name) {
          this.wasteSortingMap.set(
            sorting.name.toLowerCase(),
            Number(sorting.id),
          );
          this.log(`  ✓ WasteSorting: ${sorting.name} (id: ${sorting.id})`);
        }
      }

      // Build materialGuideMap: waste_sorting_id -> waste_material_id
      for (const guide of materialGuides) {
        if (
          guide.wastesid !== null &&
          guide.wastesid !== undefined &&
          guide.waste_meterialid !== null &&
          guide.waste_meterialid !== undefined
        ) {
          this.materialGuideMap.set(
            Number(guide.wastesid),
            Number(guide.waste_meterialid),
          );
          this.log(
            `  ✓ MaterialGuide: wastesid=${guide.wastesid} -> materialid=${guide.waste_meterialid}`,
          );
        }
      }

      // Build materialIdMap: id -> emission_factor (for numeric lookup)
      for (const material of wasteMaterials) {
        if (
          material.emission_factor !== null &&
          material.emission_factor !== undefined
        ) {
          this.materialIdMap.set(Number(material.id), material.emission_factor);
          this.log(
            `  ✓ WasteMaterial: ${material.name} (id: ${material.id}): ${material.emission_factor}`,
          );
        }
      }

      this.log(
        `✅ Loaded ${this.wasteSortingMap.size} waste sortings, ${this.materialGuideMap.size} material guides, ${this.materialIdMap.size} waste materials`,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.log(`❌ Error loading emission factors: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Debug Logging
   * Fix: Use NestJS Logger instead of console.log
   */
  public log(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;

    // Remove old logs if exceeding max
    if (this.debugLogs.length >= this.maxLogs) {
      this.debugLogs.shift(); // Remove oldest log
    }

    this.debugLogs.push(logMessage);
    this.logger.log(message);
  }

  /**
   * Get all logs
   */
  getLogs(): string[] {
    return [...this.debugLogs];
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.debugLogs = [];
  }

  /**
   * Calculate Carbon Footprint
   * Fix: Check for array type in waste_sorting
   */
  calculate(trash: TrashItem): CalculationResult {
    if (!trash || typeof trash !== 'object') {
      throw new Error('Invalid trash data: must be an object');
    }

    this.log(`🗑️ Processing trash ID: ${trash.id ?? 'unknown'}`);

    // Fix: Check for waste_sorting as object but NOT array
    if (
      trash.waste_sorting &&
      typeof trash.waste_sorting === 'object' &&
      !Array.isArray(trash.waste_sorting)
    ) {
      return this.calculateFromWasteSorting(trash);
    }

    // Fix: Support array format for waste_sorting
    if (
      trash.waste_sorting &&
      Array.isArray(trash.waste_sorting) &&
      trash.waste_sorting.length > 0
    ) {
      return this.calculateFromWasteSortingArray(trash);
    }

    if (trash.type && typeof trash.emission_factor === 'number') {
      return this.calculateFromSingleType(trash);
    }

    throw new Error(
      'Invalid trash data: must have either waste_sorting (object or array) or (type + emission_factor)',
    );
  }

  /**
   * Calculate from waste_sorting (multiple materials as object)
   * Fix: Accept weight in kg (remove /1000 conversion)
   * Fix: Add Number.isFinite() validation
   */
  private calculateFromWasteSorting(trash: TrashItem): CalculationResult {
    const { waste_sorting, weight } = trash;

    if (
      !waste_sorting ||
      typeof waste_sorting !== 'object' ||
      Array.isArray(waste_sorting)
    ) {
      throw new Error('waste_sorting must be a non-array object');
    }

    this.log(
      `  📊 Calculating from waste_sorting (object), weight: ${weight}kg`,
    );

    // Fix: Accept weight in kg like rest of codebase
    if (typeof weight !== 'number' || !Number.isFinite(weight) || weight <= 0) {
      throw new Error(
        `Invalid weight: ${weight}. Must be a positive finite number (in kg)`,
      );
    }

    if (Object.keys(waste_sorting).length === 0) {
      throw new Error('waste_sorting cannot be empty');
    }

    const totalRatio = Object.values(waste_sorting).reduce(
      (sum: number, ratio: unknown) => {
        // Fix: Add Number.isFinite() check for NaN/Infinity
        if (typeof ratio !== 'number' || !Number.isFinite(ratio) || ratio < 0) {
          throw new Error(
            `Invalid ratio: ${String(ratio)}. Must be a non-negative finite number`,
          );
        }
        return sum + ratio;
      },
      0,
    );

    if (Math.abs(totalRatio - 1.0) > 0.001) {
      this.log(
        `  ⚠️ Warning: Ratios don't sum to 1.0: ${totalRatio.toFixed(4)}`,
      );
    }

    // Use Decimal for precise calculation
    let totalCarbon = new Decimal(0);
    const breakdown: Record<string, MaterialBreakdown> = {};

    for (const [material, ratio] of Object.entries(waste_sorting)) {
      const ef = this.getEmissionFactor(material);

      // Fix: Weight is already in kg, no need to divide by 1000
      const weightDecimal = new Decimal(weight);
      const ratioDecimal = new Decimal(ratio);
      const efDecimal = new Decimal(ef);

      const materialWeightKg = weightDecimal.mul(ratioDecimal);
      const materialCarbon = materialWeightKg.mul(efDecimal);

      totalCarbon = totalCarbon.plus(materialCarbon);

      breakdown[material] = {
        ratio,
        weightGrams: materialWeightKg.mul(1000).toNumber(), // Convert to grams for display
        weightKg: materialWeightKg.toNumber(),
        emissionFactor: ef,
        carbon: materialCarbon.toNumber(),
      };

      this.log(
        `    • ${material}: ${materialCarbon.toFixed(4)} kg CO2e (EF: ${ef})`,
      );
    }

    this.log(`  ✅ Total: ${totalCarbon.toFixed(4)} kg CO2e`);

    return {
      carbon_footprint: totalCarbon.toNumber(),
      breakdown,
      method: 'waste_sorting',
      weightGrams: weight * 1000, // Convert kg to grams for consistency
      totalRatio,
    };
  }

  /**
   * Calculate from waste_sorting (multiple materials as array)
   * Fix: Support array format with {name, ratio} objects
   */
  private calculateFromWasteSortingArray(trash: TrashItem): CalculationResult {
    const { waste_sorting, weight } = trash;

    if (!waste_sorting || !Array.isArray(waste_sorting)) {
      throw new Error('waste_sorting must be an array');
    }

    this.log(
      `  📊 Calculating from waste_sorting (array), weight: ${weight}kg`,
    );

    if (typeof weight !== 'number' || !Number.isFinite(weight) || weight <= 0) {
      throw new Error(
        `Invalid weight: ${weight}. Must be a positive finite number (in kg)`,
      );
    }

    if (waste_sorting.length === 0) {
      throw new Error('waste_sorting array cannot be empty');
    }

    // Convert array format to record format
    const wasteSortingRecord: Record<string, number> = {};
    for (const item of waste_sorting) {
      if (typeof item !== 'object' || item === null) {
        throw new Error('waste_sorting array items must be objects');
      }
      const sortingItem = item as WasteSortingArrayItem;
      const name = sortingItem.name || sortingItem.material || 'unknown';
      const ratio =
        sortingItem.ratio ?? sortingItem.percentage ?? sortingItem.amount;
      if (typeof ratio !== 'number' || !Number.isFinite(ratio) || ratio < 0) {
        throw new Error(`Invalid ratio for ${name}: ${ratio}`);
      }
      wasteSortingRecord[name] = ratio;
    }

    // Reuse the object-based calculation
    return this.calculateFromWasteSorting({
      ...trash,
      waste_sorting: wasteSortingRecord,
    });
  }

  /**
   * Calculate from single type
   * Fix: Accept weight in kg (remove /1000 conversion)
   * Fix: Add Number.isFinite() validation
   */
  private calculateFromSingleType(trash: TrashItem): CalculationResult {
    const { type, weight, emission_factor } = trash;

    if (!type || typeof emission_factor !== 'number') {
      throw new Error('type and emission_factor are required');
    }

    this.log(`  📊 Calculating from single type: ${type}, weight: ${weight}kg`);

    // Fix: Accept weight in kg
    if (typeof weight !== 'number' || !Number.isFinite(weight) || weight <= 0) {
      throw new Error(
        `Invalid weight: ${weight}. Must be a positive finite number (in kg)`,
      );
    }

    if (!Number.isFinite(emission_factor) || emission_factor < 0) {
      throw new Error(`Invalid emission_factor: ${emission_factor}`);
    }

    // Fix: Weight is already in kg, no need to divide by 1000
    const weightDecimal = new Decimal(weight);
    const efDecimal = new Decimal(emission_factor);

    const carbon = weightDecimal.mul(efDecimal);

    this.log(`  ✅ Total: ${carbon.toFixed(4)} kg CO2e`);

    return {
      carbon_footprint: carbon.toNumber(),
      breakdown: {
        [type]: {
          ratio: 1.0,
          weightGrams: weight * 1000, // Convert kg to grams for display
          weightKg: weight,
          emissionFactor: emission_factor,
          carbon: carbon.toNumber(),
        },
      },
      method: 'single_type',
      weightGrams: weight * 1000, // Convert kg to grams for consistency
    };
  }

  /**
   * Calculate carbon footprint by waste_id (wastesid)
   * Used by Cron Job to calculate using MaterialGuide records
   * Supports two cases:
   *   Case 1: Has MaterialGuide (scanned waste) - sum of material weights × emission factors
   *   Case 2: No MaterialGuide (manual entry) - amount × wasteMaterial.emission_factor
   * Formula: totalCarbon = Σ (materialWeight × materialEmissionFactor) OR amount × emission_factor
   */
  async calculateByWasteId(
    wasteId: number,
    wasteHistory?: WasteHistory,
  ): Promise<number> {
    this.log(`🔄 Calculating carbon for waste_id: ${wasteId}`);

    try {
      // Find all MaterialGuide records for this waste_id
      const materialGuides = await this.entityManager.find(MaterialGuide, {
        where: { wastesid: wasteId },
        relations: ['wasteMaterial'],
      });

      // Case 1: Has MaterialGuide records (scanned waste with multiple materials)
      if (materialGuides && materialGuides.length > 0) {
        this.log(
          `  📦 Found ${materialGuides.length} material guides (scanned waste)`,
        );

        let totalCarbon = new Decimal(0);

        for (const guide of materialGuides) {
          const materialWeight = guide.weight || 0;
          const wasteMaterial = guide.wasteMaterial;

          if (!wasteMaterial) {
            this.log(
              `  ⚠️ Warning: No waste material found for guide ${guide.id}`,
            );
            continue;
          }

          const emissionFactor = wasteMaterial.emission_factor || 0;
          const materialCarbon = new Decimal(materialWeight).mul(
            new Decimal(emissionFactor),
          );

          totalCarbon = totalCarbon.plus(materialCarbon);

          this.log(
            `    • ${wasteMaterial.name}: ${materialCarbon.toFixed(4)} kg CO2e (weight: ${materialWeight}kg, EF: ${emissionFactor})`,
          );
        }

        this.log(`  ✅ Total (scanned): ${totalCarbon.toFixed(4)} kg CO2e`);
        return totalCarbon.toNumber();
      }

      // Case 2: No MaterialGuide records (manually added waste)
      this.log(`  📦 No material guides found (manual entry)`);

      if (!wasteHistory) {
        throw new Error(
          `No material guides found for waste_id: ${wasteId} and no wasteHistory provided for fallback`,
        );
      }

      const amount = wasteHistory.amount || 0;
      const wasteMaterial = wasteHistory.wasteMaterial;

      if (!wasteMaterial) {
        throw new Error(
          `No wasteMaterial found in wasteHistory for fallback calculation (waste_id: ${wasteId})`,
        );
      }

      const emissionFactor = wasteMaterial.emission_factor || 0;
      const totalCarbon = new Decimal(amount).mul(new Decimal(emissionFactor));

      this.log(
        `    • ${wasteMaterial.name}: ${totalCarbon.toFixed(4)} kg CO2e (amount: ${amount}, EF: ${emissionFactor})`,
      );
      this.log(`  ✅ Total (manual): ${totalCarbon.toFixed(4)} kg CO2e`);

      return totalCarbon.toNumber();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.log(`❌ Error calculating by waste_id: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Get Emission Factor from Database using material_guides lookup chain
   * Lookup chain: materialName -> waste_sorting_id -> waste_material_id -> emission_factor
   * Fix: Throw error for unknown materials instead of silent fallback
   */
  private getEmissionFactor(material: string | number): number {
    // Support numeric material id (direct lookup)
    if (typeof material === 'number') {
      const ef = this.materialIdMap.get(material);
      if (ef === undefined) {
        throw new Error(`Unknown material id: ${material}`);
      }
      return ef;
    }

    if (typeof material !== 'string') {
      throw new Error(
        `Invalid material type: ${typeof material}. Must be a string or number`,
      );
    }

    const normalizedMaterial = material.toLowerCase().trim();

    // Step 1: Find waste_sorting_id from WasteSorting name
    const wasteSortingId = this.wasteSortingMap.get(normalizedMaterial);
    if (wasteSortingId === undefined) {
      throw new Error(
        `Unknown material: "${material}". No waste_sorting found with name "${normalizedMaterial}".`,
      );
    }

    // Step 2: Find waste_material_id from MaterialGuide
    const wasteMaterialId = this.materialGuideMap.get(wasteSortingId);
    if (wasteMaterialId === undefined) {
      throw new Error(
        `Unknown material: "${material}". No material_guide found for waste_sorting_id ${wasteSortingId}.`,
      );
    }

    // Step 3: Get emission_factor from WasteMaterial
    const emissionFactor = this.materialIdMap.get(wasteMaterialId);
    if (emissionFactor === undefined) {
      throw new Error(
        `Unknown material: "${material}". No waste_material found with id ${wasteMaterialId} or missing emission_factor.`,
      );
    }

    return emissionFactor;
  }
}

/**
 * Calculate daily carbon footprint for Cron Job
 * Fix: Remove unnecessary transaction since only reading
 */
export async function calculateDailyCarbonFootprint(
  trashItems: TrashItem[],
  entityManager: EntityManager,
  logger?: Logger,
): Promise<DailyCalculationSummary> {
  const startTime = Date.now();

  // Fix: Remove transaction wrapper since we're only reading
  const calculator = new CarbonFootprintCalculator(entityManager, 1000, logger);
  const results: WasteHistoryRecord[] = [];
  const errors: ErrorRecord[] = [];

  calculator.log('🚀 =========================================');
  calculator.log('🚀 Starting Daily Carbon Footprint Calculation');
  calculator.log(`🚀 Total items to process: ${trashItems.length}`);
  calculator.log('🚀 =========================================');

  try {
    await calculator.loadEmissionFactors();

    calculator.log(`\n📦 Processing ${trashItems.length} trash items...\n`);

    for (let i = 0; i < trashItems.length; i++) {
      const trash = trashItems[i];

      calculator.log(
        `\n[${i + 1}/${trashItems.length}] ------------------------`,
      );

      try {
        const calculation = calculator.calculate(trash);

        const wasteHistoryRecord: WasteHistoryRecord = {
          trash_id: trash.id ?? 'unknown',
          carbon_footprint: calculation.carbon_footprint,
          calculation_method: calculation.method,
          breakdown: JSON.stringify(calculation.breakdown),
          weight_grams: trash.weight * 1000, // Convert kg to grams for storage
          calculated_at: new Date().toISOString(),
        };

        results.push(wasteHistoryRecord);

        calculator.log(
          `✅ SUCCESS: ${calculation.carbon_footprint.toFixed(4)} kg CO2e (${calculation.method})`,
        );
      } catch (error: unknown) {
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error';
        calculator.log(`❌ FAILED: ${errorMsg}`);
        errors.push({
          trash_id: trash.id ?? 'unknown',
          error: errorMsg,
        });
        // Continue processing other items
      }
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    calculator.log(`❌ CRITICAL ERROR: ${errorMsg}`);
    throw error;
  }

  const duration = Date.now() - startTime;

  calculator.log('\n📊 =========================================');
  calculator.log('📊 CALCULATION SUMMARY');
  calculator.log('📊 =========================================');
  calculator.log(`📊 Total items: ${trashItems.length}`);
  calculator.log(`📊 Success: ${results.length} ✅`);
  calculator.log(`📊 Failed: ${errors.length} ❌`);
  calculator.log(
    `📊 Duration: ${duration}ms (${(duration / 1000).toFixed(2)}s)`,
  );
  calculator.log('📊 =========================================');

  return {
    results,
    errors,
    logs: calculator.getLogs(),
    summary: {
      total: trashItems.length,
      success: results.length,
      failed: errors.length,
      duration,
    },
  };
}

export type {
  TrashItem,
  MaterialBreakdown,
  CalculationResult,
  WasteHistoryRecord,
  ErrorRecord,
  DailyCalculationSummary,
};
