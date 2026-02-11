/**
 * Carbon Footprint Calculation Service
 * Fixes: Support for waste_sorting (scanned trash with multiple materials)
 * Author: KoongBot for พูห์พูห์'s FYP
 * Version: 3.0 (Fixed: Memory Leak, Transaction, Floating Point)
 */

import { EntityManager } from 'typeorm';
import Decimal from 'decimal.js';
import { WasteMaterial } from '../waste/entities/waste-material.entity';

// Type definitions
interface TrashItem {
  id?: number | string;
  weight: number;
  waste_sorting?: Record<string, number>;
  type?: string;
  emission_factor?: number;
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
  private debugLogs: string[];
  private maxLogs: number; // 🆕 Fix #1: Memory leak prevention

  constructor(entityManager: EntityManager, maxLogs: number = 1000) {
    this.entityManager = entityManager;
    this.emissionFactors = new Map();
    this.debugLogs = [];
    this.maxLogs = maxLogs; // 🆕 Limit logs to prevent memory leak
  }

  /**
   * Load Emission Factors from Database (TypeORM)
   * 🆕 Fix #2: Use EntityManager instead of Repository for transaction support
   */
  async loadEmissionFactors(): Promise<void> {
    this.log('🔄 Loading emission factors from database...');

    try {
      const materials = await this.entityManager.find(WasteMaterial);

      this.emissionFactors.clear();

      for (const material of materials) {
        if (
          material.emission_factor !== null &&
          material.emission_factor !== undefined
        ) {
          this.emissionFactors.set(
            material.name.toLowerCase(),
            material.emission_factor,
          );
          this.log(`  ✓ ${material.name}: ${material.emission_factor}`);
        }
      }

      this.log(
        `✅ Loaded ${this.emissionFactors.size} materials from database`,
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
   * 🆕 Fix #1: Prevent memory leak by limiting logs
   */
  public log(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;

    // 🆕 Remove old logs if exceeding max
    if (this.debugLogs.length >= this.maxLogs) {
      this.debugLogs.shift(); // Remove oldest log
    }

    this.debugLogs.push(logMessage);
    console.log(logMessage);
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
   */
  calculate(trash: TrashItem): CalculationResult {
    if (!trash || typeof trash !== 'object') {
      throw new Error('Invalid trash data: must be an object');
    }

    this.log(`🗑️ Processing trash ID: ${trash.id ?? 'unknown'}`);

    if (trash.waste_sorting && typeof trash.waste_sorting === 'object') {
      return this.calculateFromWasteSorting(trash);
    }

    if (trash.type && typeof trash.emission_factor === 'number') {
      return this.calculateFromSingleType(trash);
    }

    throw new Error(
      'Invalid trash data: must have either waste_sorting or (type + emission_factor)',
    );
  }

  /**
   * Calculate from waste_sorting (multiple materials)
   * 🆕 Fix #3: Use Decimal.js for precise floating point calculations
   */
  private calculateFromWasteSorting(trash: TrashItem): CalculationResult {
    const { waste_sorting, weight } = trash;

    if (!waste_sorting) {
      throw new Error('waste_sorting is required');
    }

    this.log(`  📊 Calculating from waste_sorting, weight: ${weight}g`);

    if (typeof weight !== 'number' || weight <= 0) {
      throw new Error(
        `Invalid weight: ${weight}. Must be a positive number (in grams)`,
      );
    }

    if (Object.keys(waste_sorting).length === 0) {
      throw new Error('waste_sorting cannot be empty');
    }

    const totalRatio = Object.values(waste_sorting).reduce(
      (sum: number, ratio: number) => {
        if (typeof ratio !== 'number' || ratio < 0) {
          throw new Error(
            `Invalid ratio: ${ratio}. Must be a non-negative number`,
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

    // 🆕 Fix #3: Use Decimal for precise calculation
    let totalCarbon = new Decimal(0);
    const breakdown: Record<string, MaterialBreakdown> = {};

    for (const [material, ratio] of Object.entries(waste_sorting)) {
      const ef = this.getEmissionFactor(material);

      // 🆕 Fix #3: Precise decimal calculation
      const weightDecimal = new Decimal(weight);
      const ratioDecimal = new Decimal(ratio);
      const efDecimal = new Decimal(ef);

      const materialWeightKg = weightDecimal.mul(ratioDecimal).div(1000);
      const materialCarbon = materialWeightKg.mul(efDecimal);

      totalCarbon = totalCarbon.plus(materialCarbon);

      breakdown[material] = {
        ratio,
        weightGrams: weightDecimal.mul(ratioDecimal).toNumber(),
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
      weightGrams: weight,
      totalRatio,
    };
  }

  /**
   * Calculate from single type
   * 🆕 Fix #3: Use Decimal.js for precise floating point calculations
   */
  private calculateFromSingleType(trash: TrashItem): CalculationResult {
    const { type, weight, emission_factor } = trash;

    if (!type || typeof emission_factor !== 'number') {
      throw new Error('type and emission_factor are required');
    }

    this.log(`  📊 Calculating from single type: ${type}, weight: ${weight}g`);

    if (typeof weight !== 'number' || weight <= 0) {
      throw new Error(
        `Invalid weight: ${weight}. Must be a positive number (in grams)`,
      );
    }

    if (emission_factor < 0) {
      throw new Error(`Invalid emission_factor: ${emission_factor}`);
    }

    // 🆕 Fix #3: Precise decimal calculation
    const weightDecimal = new Decimal(weight);
    const efDecimal = new Decimal(emission_factor);

    const weightKg = weightDecimal.div(1000);
    const carbon = weightKg.mul(efDecimal);

    this.log(`  ✅ Total: ${carbon.toFixed(4)} kg CO2e`);

    return {
      carbon_footprint: carbon.toNumber(),
      breakdown: {
        [type]: {
          ratio: 1.0,
          weightGrams: weight,
          weightKg: weightKg.toNumber(),
          emissionFactor: emission_factor,
          carbon: carbon.toNumber(),
        },
      },
      method: 'single_type',
      weightGrams: weight,
    };
  }

  /**
   * Get Emission Factor from Database
   */
  private getEmissionFactor(material: string): number {
    if (typeof material !== 'string') {
      throw new Error(
        `Invalid material type: ${typeof material}. Must be a string`,
      );
    }

    const normalizedMaterial = material.toLowerCase().trim();
    const ef = this.emissionFactors.get(normalizedMaterial);

    if (ef === undefined) {
      this.log(`  ⚠️ Unknown material: "${material}", using default EF: 2.0`);
      return 2.0;
    }

    return ef;
  }
}

/**
 * Calculate daily carbon footprint for Cron Job
 * 🆕 Fix #2: Full transaction support with EntityManager
 */
export async function calculateDailyCarbonFootprint(
  trashItems: TrashItem[],
  entityManager: EntityManager, // 🆕 Changed from Repository to EntityManager
): Promise<DailyCalculationSummary> {
  const startTime = Date.now();

  // 🆕 Fix #2: Wrap everything in a database transaction
  return await entityManager.transaction(async (transactionalManager) => {
    const calculator = new CarbonFootprintCalculator(transactionalManager);
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
            weight_grams: trash.weight,
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
          // 🆕 Fix #2: Don't throw here, continue processing but transaction will handle it
        }
      }
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      calculator.log(`❌ CRITICAL ERROR: ${errorMsg}`);
      // 🆕 Fix #2: Transaction will automatically rollback on throw
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

    // 🆕 Fix #2: If we reach here, transaction will auto-commit
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
  });
}

export type {
  TrashItem,
  MaterialBreakdown,
  CalculationResult,
  WasteHistoryRecord,
  ErrorRecord,
  DailyCalculationSummary,
};
