/**
 * Carbon Footprint Calculation Service
 * Fixes: Support for waste_sorting (scanned trash with multiple materials)
 * Author: KoongBot for พูห์พูห์'s FYP
 * Version: 2.0 (With TypeORM Repository + Debug Logging)
 */

import { Repository } from 'typeorm';
import { WasteMaterial } from '../waste/entities/waste-material.entity';

class CarbonFootprintCalculator {
  private wasteMaterialRepository: Repository<WasteMaterial>;
  private emissionFactors: Map<string, number>;
  private debugLogs: string[];

  constructor(wasteMaterialRepository: Repository<WasteMaterial>) {
    this.wasteMaterialRepository = wasteMaterialRepository;
    this.emissionFactors = new Map();
    this.debugLogs = [];
  }

  /**
   * 🆕 โหลด Emission Factors จาก Database (TypeORM)
   */
  async loadEmissionFactors(): Promise<void> {
    this.log('🔄 Loading emission factors from database...');
    
    try {
      const materials = await this.wasteMaterialRepository.find();
      
      this.emissionFactors.clear();
      
      for (const material of materials) {
        if (material.emission_factor !== null && material.emission_factor !== undefined) {
          // ใช้ name lowercase เป็น key
          this.emissionFactors.set(material.name.toLowerCase(), material.emission_factor);
          this.log(`  ✓ ${material.name}: ${material.emission_factor}`);
        }
      }
      
      this.log(`✅ Loaded ${this.emissionFactors.size} materials from database`);
      
    } catch (error) {
      this.log(`❌ Error loading emission factors: ${error.message}`);
      throw error;
    }
  }

  /**
   * 🆕 Debug Logging
   */
  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    this.debugLogs.push(logMessage);
    console.log(logMessage);
  }

  /**
   * 🆕 ดึง Logs ทั้งหมด
   */
  getLogs(): string[] {
    return [...this.debugLogs];
  }

  /**
   * 🆕 Clear Logs
   */
  clearLogs(): void {
    this.debugLogs = [];
  }

  /**
   * คำนวณ Carbon Footprint หลัก
   */
  calculate(trash: any): { carbon_footprint: number; breakdown: any; method: string } {
    // Validation
    if (!trash || typeof trash !== 'object') {
      throw new Error('Invalid trash data: must be an object');
    }

    this.log(`🗑️ Processing trash ID: ${trash.id || 'unknown'}`);

    // กรณี 1: ขยะที่มี waste_sorting (สแกนมา)
    if (trash.waste_sorting && typeof trash.waste_sorting === 'object') {
      return this.calculateFromWasteSorting(trash);
    }
    
    // กรณี 2: ขยะที่มี type เดียว (บันทึกตรง)
    if (trash.type && typeof trash.emission_factor === 'number') {
      return this.calculateFromSingleType(trash);
    }
    
    throw new Error('Invalid trash data: must have either waste_sorting or (type + emission_factor)');
  }

  /**
   * คำนวณจาก waste_sorting (หลาย material)
   */
  calculateFromWasteSorting(trash: any): { carbon_footprint: number; breakdown: any; method: string } {
    const { waste_sorting, weight } = trash;
    
    this.log(`  📊 Calculating from waste_sorting, weight: ${weight}g`);
    
    // Validation
    if (typeof weight !== 'number' || weight <= 0) {
      throw new Error(`Invalid weight: ${weight}. Must be a positive number (in grams)`);
    }
    
    if (Object.keys(waste_sorting).length === 0) {
      throw new Error('waste_sorting cannot be empty');
    }

    // ตรวจสอบว่าสัดส่วนรวมกันเป็น 1.0
    const totalRatio = Object.values(waste_sorting).reduce((sum: number, ratio: any) => {
      if (typeof ratio !== 'number' || ratio < 0) {
        throw new Error(`Invalid ratio: ${ratio}. Must be a non-negative number`);
      }
      return sum + ratio;
    }, 0);
    
    if (Math.abs(totalRatio - 1.0) > 0.001) {
      this.log(`  ⚠️ Warning: Ratios don't sum to 1.0: ${totalRatio.toFixed(4)}`);
    }

    let totalCarbon = 0;
    const breakdown: any = {};

    for (const [material, ratio] of Object.entries(waste_sorting)) {
      const ef = this.getEmissionFactor(material);
      
      // แปลงกรัมเป็น kg
      const materialWeightKg = (weight * (ratio as number)) / 1000;
      const materialCarbon = materialWeightKg * ef;
      
      totalCarbon += materialCarbon;
      breakdown[material] = {
        ratio,
        weightGrams: weight * (ratio as number),
        weightKg: materialWeightKg,
        emissionFactor: ef,
        carbon: materialCarbon
      };
      
      this.log(`    • ${material}: ${materialCarbon.toFixed(4)} kg CO2e (EF: ${ef})`);
    }

    this.log(`  ✅ Total: ${totalCarbon.toFixed(4)} kg CO2e`);

    return {
      carbon_footprint: totalCarbon,
      breakdown,
      method: 'waste_sorting'
    };
  }

  /**
   * คำนวณจาก type เดียว (แบบเดิม)
   */
  calculateFromSingleType(trash: any): { carbon_footprint: number; breakdown: any; method: string } {
    const { type, weight, emission_factor } = trash;
    
    this.log(`  📊 Calculating from single type: ${type}, weight: ${weight}g`);
    
    // Validation
    if (typeof weight !== 'number' || weight <= 0) {
      throw new Error(`Invalid weight: ${weight}. Must be a positive number (in grams)`);
    }
    
    if (typeof emission_factor !== 'number' || emission_factor < 0) {
      throw new Error(`Invalid emission_factor: ${emission_factor}`);
    }
    
    // แปลงกรัมเป็น kg
    const weightKg = weight / 1000;
    const carbon = weightKg * emission_factor;
    
    this.log(`  ✅ Total: ${carbon.toFixed(4)} kg CO2e`);
    
    return {
      carbon_footprint: carbon,
      breakdown: {
        [type]: {
          ratio: 1.0,
          weightGrams: weight,
          weightKg: weightKg,
          emissionFactor: emission_factor,
          carbon: carbon
        }
      },
      method: 'single_type'
    };
  }

  /**
   * 🆕 ดึง Emission Factor จาก Database (แทน hardcode)
   */
  getEmissionFactor(material: string): number {
    if (typeof material !== 'string') {
      throw new Error(`Invalid material type: ${typeof material}. Must be a string`);
    }
    
    const normalizedMaterial = material.toLowerCase().trim();
    
    // ดึงจาก Map ที่โหลดจาก database
    const ef = this.emissionFactors.get(normalizedMaterial);
    
    if (ef === undefined) {
      this.log(`  ⚠️ Unknown material: "${material}", using default EF: 2.0`);
      return 2.0; // ค่า default
    }
    
    return ef;
  }
}

// ==================== 🆕 สำหรับ Cron Job พร้อม Debug Logging ====================

interface CalculationResult {
  trash_id: number;
  carbon_footprint: number;
  calculation_method: string;
  breakdown: string;
  weight_grams: number;
  calculated_at: string;
}

interface DailyCalculationSummary {
  results: CalculationResult[];
  errors: { trash_id: number; error: string }[];
  logs: string[];
  summary: {
    total: number;
    success: number;
    failed: number;
    duration: number; // milliseconds
  };
}

/**
 * 🆕 ฟังก์ชันสำหรับ Cron Job 02:00 น. พร้อม Debug Logging
 * 
 * @param trashItems - รายการขยะที่ต้องคำนวณ
 * @param wasteMaterialRepository - TypeORM Repository
 * @returns {Promise<DailyCalculationSummary>} ผลลัพธ์พร้อม logs
 */
async function calculateDailyCarbonFootprint(
  trashItems: any[], 
  wasteMaterialRepository: Repository<WasteMaterial>
): Promise<DailyCalculationSummary> {
  
  const startTime = Date.now();
  const calculator = new CarbonFootprintCalculator(wasteMaterialRepository);
  const results: CalculationResult[] = [];
  const errors: { trash_id: number; error: string }[] = [];
  
  calculator.log('🚀 =========================================');
  calculator.log('🚀 Starting Daily Carbon Footprint Calculation');
  calculator.log(`🚀 Total items to process: ${trashItems.length}`);
  calculator.log('🚀 =========================================');
  
  try {
    // 🆕 โหลด emission factors จาก database
    await calculator.loadEmissionFactors();
    
    calculator.log(`\n📦 Processing ${trashItems.length} trash items...\n`);
    
    for (let i = 0; i < trashItems.length; i++) {
      const trash = trashItems[i];
      
      calculator.log(`\n[${i + 1}/${trashItems.length}] ------------------------`);
      
      try {
        // คำนวณ carbon footprint
        const calculation = calculator.calculate(trash);
        
        // เตรียมข้อมูลสำหรับบันทึกลง waste_history
        const wasteHistoryRecord: CalculationResult = {
          trash_id: trash.id,
          carbon_footprint: calculation.carbon_footprint,
          calculation_method: calculation.method,
          breakdown: JSON.stringify(calculation.breakdown),
          weight_grams: trash.weight,
          calculated_at: new Date().toISOString()
        };
        
        results.push(wasteHistoryRecord);
        
        calculator.log(`✅ SUCCESS: ${calculation.carbon_footprint.toFixed(4)} kg CO2e (${calculation.method})`);
        
      } catch (error: any) {
        const errorMsg = error.message;
        calculator.log(`❌ FAILED: ${errorMsg}`);
        errors.push({ 
          trash_id: trash.id || 'unknown', 
          error: errorMsg 
        });
      }
    }
    
  } catch (error: any) {
    calculator.log(`❌ CRITICAL ERROR: ${error.message}`);
    throw error;
  }
  
  const duration = Date.now() - startTime;
  
  // สรุปผล
  calculator.log('\n📊 =========================================');
  calculator.log('📊 CALCULATION SUMMARY');
  calculator.log('📊 =========================================');
  calculator.log(`📊 Total items: ${trashItems.length}`);
  calculator.log(`📊 Success: ${results.length} ✅`);
  calculator.log(`📊 Failed: ${errors.length} ❌`);
  calculator.log(`📊 Duration: ${duration}ms (${(duration/1000).toFixed(2)}s)`);
  calculator.log('📊 =========================================');
  
  return {
    results,
    errors,
    logs: calculator.getLogs(),
    summary: {
      total: trashItems.length,
      success: results.length,
      failed: errors.length,
      duration
    }
  };
}

// Export สำหรับใช้ในโปรเจกต์
export {
  CarbonFootprintCalculator,
  calculateDailyCarbonFootprint
};
export type { CalculationResult, DailyCalculationSummary };
