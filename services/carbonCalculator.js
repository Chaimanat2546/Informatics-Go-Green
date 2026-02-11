/**
 * Carbon Footprint Calculation Service
 * Fixes: Support for waste_sorting (scanned trash with multiple materials)
 * Author: KoongBot for พูห์พูห์'s FYP
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
    // กรณี 1: ขยะที่มี waste_sorting (สแกนมา)
    if (trash.waste_sorting && typeof trash.waste_sorting === 'object') {
      return this.calculateFromWasteSorting(trash);
    }
    
    // กรณี 2: ขยะที่มี type เดียว (บันทึกตรง)
    if (trash.type && trash.emission_factor) {
      return this.calculateFromSingleType(trash);
    }
    
    // กรณี 3: ไม่มีข้อมูลพอ
    console.warn('Invalid trash data:', trash);
    return 0;
  }

  /**
   * คำนวณจาก waste_sorting (หลาย material)
   * คำนวณแยกแต่ละ material แล้วรวมกัน
   */
  calculateFromWasteSorting(trash) {
    const { waste_sorting, weight } = trash;
    let totalCarbon = 0;
    const breakdown = {};

    // วน loop คำนวณแต่ละ material
    for (const [material, ratio] of Object.entries(waste_sorting)) {
      // หา Emission Factor ของ material นี้
      const ef = this.getEmissionFactor(material);
      
      // คำนวณ: น้ำหนัก × สัดส่วน × Emission Factor
      const materialWeight = weight * ratio;
      const materialCarbon = materialWeight * ef;
      
      totalCarbon += materialCarbon;
      breakdown[material] = {
        ratio,
        weight: materialWeight,
        emissionFactor: ef,
        carbon: materialCarbon
      };
    }

    return {
      carbon_footprint: totalCarbon,
      breakdown,
      method: 'waste_sorting'
    };
  }

  /**
   * คำนวณจาก type เดียว (แบบเดิม)
   */
  calculateFromSingleType(trash) {
    const carbon = trash.weight * trash.emission_factor;
    
    return {
      carbon_footprint: carbon,
      breakdown: {
        [trash.type]: {
          ratio: 1.0,
          weight: trash.weight,
          emissionFactor: trash.emission_factor,
          carbon: carbon
        }
      },
      method: 'single_type'
    };
  }

  /**
   * ดึง Emission Factor ของ material
   * ถ้าไม่มีจะใช้ค่า default หรือ throw error
   */
  getEmissionFactor(material) {
    const ef = this.emissionFactors[material.toLowerCase()];
    if (ef === undefined) {
      console.warn(`Unknown material: ${material}, using default EF: 2.0`);
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
  weight: 100,
  emission_factor: 2.5
};

// ใช้งาน
const calculator = new CarbonFootprintCalculator();

console.log('=== Scanned Trash ===');
const result1 = calculator.calculate(scannedTrash);
console.log('Carbon Footprint:', result1.carbon_footprint, 'kg CO2e');
console.log('Breakdown:', result1.breakdown);
// Output: 251.1 (คำนวณได้แล้ว!)

console.log('\n=== Manual Trash ===');
const result2 = calculator.calculate(manualTrash);
console.log('Carbon Footprint:', result2.carbon_footprint, 'kg CO2e');
// Output: 250 (เหมือนเดิม)

// ==================== สำหรับ Cron Job ====================

/**
 * ฟังก์ชันสำหรับ Cron Job 02:00 น.
 * คำนวณ carbon footprint สำหรับขยะทั้งหมดที่ยังไม่ได้คำนวณ
 */
async function calculateDailyCarbonFootprint(trashItems) {
  const calculator = new CarbonFootprintCalculator();
  const results = [];

  for (const trash of trashItems) {
    // คำนวณ carbon footprint
    const calculation = calculator.calculate(trash);
    
    // เตรียมข้อมูลสำหรับบันทึกลง waste_history
    const wasteHistoryRecord = {
      trash_id: trash.id,
      carbon_footprint: calculation.carbon_footprint,
      calculation_method: calculation.method,
      breakdown: calculation.breakdown,
      calculated_at: new Date().toISOString()
    };
    
    results.push(wasteHistoryRecord);
    
    console.log(`Trash ${trash.id}: ${calculation.carbon_footprint} kg CO2e (${calculation.method})`);
  }

  return results;
}

// Export สำหรับใช้ในโปรเจกต์
module.exports = {
  CarbonFootprintCalculator,
  calculateDailyCarbonFootprint
};
