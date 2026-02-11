/**
 * Carbon Footprint Calculation Service
 * Fixes: Support for waste_sorting (scanned trash with multiple materials)
 * Author: KoongBot for พูห์พูห์'s FYP
 * Version: 1.1 (Fixed unit conversion and validation)
 */

class CarbonFootprintCalculator {
  constructor(emissionFactors) {
    // เก็บ Emission Factor ของแต่ละ material type
    // หน่วย: kg CO2e ต่อ kg ของขยะ
    this.emissionFactors = emissionFactors || {
      plastic: 2.5,
      paper: 1.2,
      paper_label: 1.2,
      metal: 5.0,
      metal_cap: 5.0,
      glass: 0.8,
      organic: 0.3,
      electronic: 10.0,
      // เพิ่ม material อื่นๆ ตามต้องการ
    };
  }

  /**
   * คำนวณ Carbon Footprint หลัก
   * รองรับทั้งขยะแบบ type เดียว และขยะที่สแกน (waste_sorting)
   */
  calculate(trash) {
    // Validation: ต้องมีข้อมูล trash
    if (!trash || typeof trash !== 'object') {
      throw new Error('Invalid trash data: must be an object');
    }

    // กรณี 1: ขยะที่มี waste_sorting (สแกนมา)
    if (trash.waste_sorting && typeof trash.waste_sorting === 'object') {
      return this.calculateFromWasteSorting(trash);
    }
    
    // กรณี 2: ขยะที่มี type เดียว (บันทึกตรง)
    if (trash.type && typeof trash.emission_factor === 'number') {
      return this.calculateFromSingleType(trash);
    }
    
    // กรณี 3: ไม่มีข้อมูลพอ
    throw new Error('Invalid trash data: must have either waste_sorting or (type + emission_factor)');
  }

  /**
   * คำนวณจาก waste_sorting (หลาย material)
   * คำนวณแยกแต่ละ material แล้วรวมกัน
   */
  calculateFromWasteSorting(trash) {
    const { waste_sorting, weight } = trash;
    
    // Validation: weight ต้องเป็นตัวเลขบวก
    if (typeof weight !== 'number' || weight <= 0) {
      throw new Error(`Invalid weight: ${weight}. Must be a positive number (in grams)`);
    }
    
    // Validation: waste_sorting ต้องมีข้อมูล
    if (Object.keys(waste_sorting).length === 0) {
      throw new Error('waste_sorting cannot be empty');
    }

    // 🆕 Validation: ตรวจสอบว่าสัดส่วนรวมกันเป็น 1.0 (100%)
    const totalRatio = Object.values(waste_sorting).reduce((sum, ratio) => {
      if (typeof ratio !== 'number' || ratio < 0) {
        throw new Error(`Invalid ratio: ${ratio}. Must be a non-negative number`);
      }
      return sum + ratio;
    }, 0);
    
    if (Math.abs(totalRatio - 1.0) > 0.001) {
      console.warn(`[Warning] Ratios don't sum to 1.0: ${totalRatio.toFixed(4)} (expected: 1.0)`);
    }

    let totalCarbon = 0;
    const breakdown = {};

    // วน loop คำนวณแต่ละ material
    for (const [material, ratio] of Object.entries(waste_sorting)) {
      // หา Emission Factor ของ material นี้
      const ef = this.getEmissionFactor(material);
      
      // 🆕 คำนวณ: น้ำหนัก(กรัม) × สัดส่วน ÷ 1000 → เป็น kg
      const materialWeightKg = (weight * ratio) / 1000;
      const materialCarbon = materialWeightKg * ef;
      
      totalCarbon += materialCarbon;
      breakdown[material] = {
        ratio: ratio,
        weightGrams: weight * ratio,
        weightKg: materialWeightKg,
        emissionFactor: ef,
        carbon: materialCarbon
      };
    }

    return {
      carbon_footprint: totalCarbon,
      breakdown,
      method: 'waste_sorting',
      weightGrams: weight,
      totalRatio: totalRatio
    };
  }

  /**
   * คำนวณจาก type เดียว (แบบเดิม)
   */
  calculateFromSingleType(trash) {
    const { type, weight, emission_factor } = trash;
    
    // Validation
    if (typeof weight !== 'number' || weight <= 0) {
      throw new Error(`Invalid weight: ${weight}. Must be a positive number (in grams)`);
    }
    
    if (typeof emission_factor !== 'number' || emission_factor < 0) {
      throw new Error(`Invalid emission_factor: ${emission_factor}. Must be a non-negative number`);
    }
    
    // 🆕 แปลงกรัมเป็น kg ก่อนคำนวณ
    const weightKg = weight / 1000;
    const carbon = weightKg * emission_factor;
    
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
      method: 'single_type',
      weightGrams: weight
    };
  }

  /**
   * ดึง Emission Factor ของ material
   * ถ้าไม่มีจะใช้ค่า default และแจ้งเตือน
   */
  getEmissionFactor(material) {
    if (typeof material !== 'string') {
      throw new Error(`Invalid material type: ${typeof material}. Must be a string`);
    }
    
    const normalizedMaterial = material.toLowerCase().trim();
    const ef = this.emissionFactors[normalizedMaterial];
    
    if (ef === undefined) {
      console.warn(`[Warning] Unknown material: "${material}", using default EF: 2.0`);
      return 2.0; // ค่า default
    }
    return ef;
  }
}

// ==================== ตัวอย่างการใช้งาน ====================

// ตัวอย่างขยะที่สแกน (ก่อนแก้ไข: คำนวณไม่ได้)
const scannedTrash = {
  id: 1,
  scan_method: "barcode",
  waste_sorting: {
    plastic: 0.95,
    paper_label: 0.03,
    metal_cap: 0.02
  },
  weight: 100  // กรัม
};

// ตัวอย่างขยะแบบระบุ type (ทำงานได้ปกติ)
const manualTrash = {
  id: 2,
  type: "plastic",
  weight: 100,  // กรัม
  emission_factor: 2.5
};

// ใช้งาน
const calculator = new CarbonFootprintCalculator();

try {
  console.log('=== Scanned Trash ===');
  const result1 = calculator.calculate(scannedTrash);
  console.log('Carbon Footprint:', result1.carbon_footprint.toFixed(4), 'kg CO2e');
  console.log('Breakdown:', result1.breakdown);
  // Output: 0.2511 kg CO2e (แก้ไขหน่วยถูกต้องแล้ว!)

  console.log('\n=== Manual Trash ===');
  const result2 = calculator.calculate(manualTrash);
  console.log('Carbon Footprint:', result2.carbon_footprint.toFixed(4), 'kg CO2e');
  // Output: 0.2500 kg CO2e (แก้ไขหน่วยถูกต้องแล้ว!)
} catch (error) {
  console.error('Calculation error:', error.message);
}

// ==================== สำหรับ Cron Job ====================

/**
 * ฟังก์ชันสำหรับ Cron Job 02:00 น.
 * คำนวณ carbon footprint สำหรับขยะทั้งหมดที่ยังไม่ได้คำนวณ
 * 
 * @param {Array} trashItems - รายการขยะที่ต้องคำนวณ
 * @param {Object} db - database connection (optional, สำหรับ transaction)
 * @returns {Promise<Array>} ผลลัพธ์การคำนวณทั้งหมด
 */
async function calculateDailyCarbonFootprint(trashItems, db = null) {
  const calculator = new CarbonFootprintCalculator();
  const results = [];
  const errors = [];

  // 🆕 ใช้ transaction ถ้ามี database
  const transaction = db ? await db.beginTransaction() : null;

  try {
    for (const trash of trashItems) {
      try {
        // คำนวณ carbon footprint
        const calculation = calculator.calculate(trash);
        
        // เตรียมข้อมูลสำหรับบันทึกลง waste_history
        const wasteHistoryRecord = {
          trash_id: trash.id,
          carbon_footprint: calculation.carbon_footprint,
          calculation_method: calculation.method,
          breakdown: JSON.stringify(calculation.breakdown), // เก็บเป็น JSON
          weight_grams: calculation.weightGrams,
          calculated_at: new Date().toISOString()
        };
        
        results.push(wasteHistoryRecord);
        
        console.log(`✓ Trash ${trash.id}: ${calculation.carbon_footprint.toFixed(4)} kg CO2e (${calculation.method})`);
        
      } catch (error) {
        console.error(`✗ Trash ${trash.id}: ${error.message}`);
        errors.push({ trash_id: trash.id, error: error.message });
        // 🆕 ไม่ throw error ทันที แต่เก็บไว้แล้ว continue
      }
    }

    // 🆕 Commit transaction ถ้าทุกอย่างผ่าน
    if (transaction) {
      await transaction.commit();
    }

    // สรุปผล
    console.log(`\n=== Summary ===`);
    console.log(`Success: ${results.length} items`);
    console.log(`Failed: ${errors.length} items`);
    
    if (errors.length > 0) {
      console.log('Errors:', errors);
    }

    return { results, errors };
    
  } catch (error) {
    // 🆕 Rollback ถ้ามี error ใหญ่
    if (transaction) {
      await transaction.rollback();
    }
    throw error;
  }
}

// Export สำหรับใช้ในโปรเจกต์
module.exports = {
  CarbonFootprintCalculator,
  calculateDailyCarbonFootprint
};
