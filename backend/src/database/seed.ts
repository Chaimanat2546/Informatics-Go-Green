import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

// Import all entities
import { User } from '../users/user.entity';
import { WasteCategory } from '../waste/entities/waste-category.entity';
import { WasteMaterial } from '../waste/entities/waste-material.entity';
import { Waste } from '../waste/entities/waste.entity';
import { WasteHistory } from '../waste/entities/waste-history.entity';
import { WasteSorting } from '../waste/entities/waste-sorting.entity';
import { MaterialGuide } from '../waste/entities/material-guide.entity';
import { WasteCalculateLog } from '../waste/entities/waste-calculate-log.entity';
import { WasteManagementMethod } from '../waste/entities/waste-management-method.entity';
import { SchedulerSettings } from '../scheduler/entities/scheduler-settings.entity';
import { SchedulerLock } from '../scheduler/entities/scheduler-lock.entity';

export async function seedDatabase(dataSource: DataSource): Promise<void> {
  console.log('🌱 Starting database seeding...\n');

  // Clear existing data (reverse dependency order)
  console.log('🧹 Cleaning existing data...');
  await dataSource.query('TRUNCATE TABLE "scheduler_locks" CASCADE');
  await dataSource.query('TRUNCATE TABLE "scheduler_settings" CASCADE');
  await dataSource.query('TRUNCATE TABLE "waste_calculate_logs" CASCADE');
  await dataSource.query('TRUNCATE TABLE "waste_history" CASCADE');
  await dataSource.query('TRUNCATE TABLE "material_guides" CASCADE');
  await dataSource.query('TRUNCATE TABLE "waste_sorting" CASCADE');
  await dataSource.query('TRUNCATE TABLE "wastes" CASCADE');
  await dataSource.query('TRUNCATE TABLE "waste_meterial" CASCADE');
  await dataSource.query('TRUNCATE TABLE "waste_categories" CASCADE');
  await dataSource.query('TRUNCATE TABLE "users" CASCADE');
  console.log('  ✅ All tables cleaned\n');

  // ============================================================
  // 1. USERS
  // ============================================================
  console.log('👤 Seeding Users...');
  const userRepo = dataSource.getRepository(User);

  const saltRounds = 10;
  const adminPassword = await bcrypt.hash('Admin@1234', saltRounds);
  const userPassword = await bcrypt.hash('User@1234', saltRounds);

  const adminUser = userRepo.create({
    email: 'admin@informatics.buu.ac.th',
    password: adminPassword,
    firstName: 'Informatics',
    lastName: 'BUU',
    phoneNumber: '038-102-222',
    province: 'ชลบุรี',
    isActive: true,
    role: 'admin',
    provider: 'local',
  });

  const normalUser = userRepo.create({
    email: 'somchai@example.com',
    password: userPassword,
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    phoneNumber: '081-234-5678',
    province: 'ชลบุรี',
    isActive: true,
    role: 'user',
    provider: 'local',
  });

  const savedAdmin = await userRepo.save(adminUser);
  const savedUser = await userRepo.save(normalUser);
  console.log(`  ✅ Created ${2} users (admin: ${savedAdmin.email})\n`);

  // ============================================================
  // 2. WASTE CATEGORIES
  // ============================================================
  console.log('📦 Seeding Waste Categories...');
  const categoryRepo = dataSource.getRepository(WasteCategory);

  const categories = await categoryRepo.save([
    categoryRepo.create({ name: 'ขยะทั่วไป' }),
    categoryRepo.create({ name: 'ขยะรีไซเคิล' }),
    categoryRepo.create({ name: 'ขยะอันตราย' }),
    categoryRepo.create({ name: 'ขยะอินทรีย์' }),
  ]);

  const [catGeneral, catRecycle, catHazardous, catOrganic] = categories;
  console.log(`  ✅ Created ${categories.length} waste categories\n`);

  // ============================================================
  // 3. WASTE MATERIALS (with emission factors)
  // ============================================================
  console.log('🧪 Seeding Waste Materials...');
  const materialRepo = dataSource.getRepository(WasteMaterial);

  const materials = await materialRepo.save([
    materialRepo.create({
      name: 'พลาสติก PET',
      emissionFactor: 2.29,
      unit: 'kg CO₂e/kg',
      wasteCategoryId: Number(catRecycle.id),
    }),
    materialRepo.create({
      name: 'กระดาษ',
      emissionFactor: 1.17,
      unit: 'kg CO₂e/kg',
      wasteCategoryId: Number(catRecycle.id),
    }),
    materialRepo.create({
      name: 'แก้ว',
      emissionFactor: 0.86,
      unit: 'kg CO₂e/kg',
      wasteCategoryId: Number(catRecycle.id),
    }),
    materialRepo.create({
      name: 'อลูมิเนียม',
      emissionFactor: 8.14,
      unit: 'kg CO₂e/kg',
      wasteCategoryId: Number(catRecycle.id),
    }),
    materialRepo.create({
      name: 'เศษอาหาร',
      emissionFactor: 0.58,
      unit: 'kg CO₂e/kg',
      wasteCategoryId: Number(catOrganic.id),
    }),
    materialRepo.create({
      name: 'ถ่านไฟฉาย / แบตเตอรี่',
      emissionFactor: 3.5,
      unit: 'kg CO₂e/kg',
      wasteCategoryId: Number(catHazardous.id),
    }),
    materialRepo.create({
      name: 'โฟม (Styrofoam)',
      emissionFactor: 3.3,
      unit: 'kg CO₂e/kg',
      wasteCategoryId: Number(catGeneral.id),
    }),
    materialRepo.create({
      name: 'ผ้า / สิ่งทอ',
      emissionFactor: 1.5,
      unit: 'kg CO₂e/kg',
      wasteCategoryId: Number(catGeneral.id),
    }),
  ]);

  const matPET = materials[0];
  const matPaper = materials[1];
  const matGlass = materials[2];
  const matAluminum = materials[3];
  const matFood = materials[4];
  // materials[5] = ถ่านไฟฉาย / แบตเตอรี่
  const matFoam = materials[6];
  // materials[7] = ผ้า / สิ่งทอ
  console.log(`  ✅ Created ${materials.length} waste materials\n`);

  // ============================================================
  // 4. WASTES
  // ============================================================
  console.log('🗑️  Seeding Wastes...');
  const wasteRepo = dataSource.getRepository(Waste);

  const wastes = await wasteRepo.save([
    wasteRepo.create({
      name: 'ขวดน้ำพลาสติก',
      barcode: 8851028001010,
      wasteCategoryId: Number(catRecycle.id),
    }),
    wasteRepo.create({
      name: 'กล่องกระดาษ',
      barcode: 8851028002020,
      wasteCategoryId: Number(catRecycle.id),
    }),
    wasteRepo.create({
      name: 'ขวดแก้ว',
      barcode: 8851028003030,
      wasteCategoryId: Number(catRecycle.id),
    }),
    wasteRepo.create({
      name: 'กระป๋องอลูมิเนียม',
      barcode: 8851028004040,
      wasteCategoryId: Number(catRecycle.id),
    }),
    wasteRepo.create({
      name: 'เปลือกผลไม้',
      wasteCategoryId: Number(catOrganic.id),
    }),
    wasteRepo.create({
      name: 'กล่องโฟมใส่อาหาร',
      wasteCategoryId: Number(catGeneral.id),
    }),
  ]);

  const [wasteBottle, wasteBox, wasteGlass, wasteCan, wasteFruit, wasteFoam] =
    wastes;
  console.log(`  ✅ Created ${wastes.length} wastes\n`);

  // ============================================================
  // 4b. ADDITIONAL WASTES (for manual entry testing - NO MaterialGuides)
  // ============================================================
  console.log('🗑️  Seeding Additional Wastes (manual entry only)...');

  const manualWastes = await wasteRepo.save([
    wasteRepo.create({
      name: 'ซองขนม',
      wasteCategoryId: Number(catGeneral.id),
    }),
    wasteRepo.create({
      name: 'กล่องนม',
      wasteCategoryId: Number(catRecycle.id),
    }),
    wasteRepo.create({
      name: 'ขวดแก้วน้ำผลไม้',
      barcode: 8851028005050,
      wasteCategoryId: Number(catRecycle.id),
    }),
  ]);

  const [wasteSnackBag, wasteMilkBox, wasteJuiceBottle] = manualWastes;
  console.log(`  ✅ Created ${manualWastes.length} manual-only wastes\n`);

  // ============================================================
  // 5. WASTE SORTING
  // ============================================================
  console.log('♻️  Seeding Waste Sorting...');
  const sortingRepo = dataSource.getRepository(WasteSorting);

  const sortings = await sortingRepo.save([
    sortingRepo.create({
      name: 'ล้างทำความสะอาด',
      description: 'ล้างขวดน้ำให้สะอาดก่อนทิ้ง แกะฉลากออก',
      wastesid: Number(wasteBottle.id),
    }),
    sortingRepo.create({
      name: 'พับให้แบน',
      description: 'พับกล่องกระดาษให้แบนเพื่อประหยัดพื้นที่',
      wastesid: Number(wasteBox.id),
    }),
    sortingRepo.create({
      name: 'แยกฝา',
      description: 'แยกฝาขวดแก้วออก ล้างให้สะอาด',
      wastesid: Number(wasteGlass.id),
    }),
    sortingRepo.create({
      name: 'บีบให้แบน',
      description: 'บีบกระป๋องให้แบนเพื่อประหยัดพื้นที่',
      wastesid: Number(wasteCan.id),
    }),
    sortingRepo.create({
      name: 'ใส่ถังขยะเปียก',
      description: 'ทิ้งเปลือกผลไม้ในถังขยะเปียก / ขยะอินทรีย์',
      wastesid: Number(wasteFruit.id),
    }),
    sortingRepo.create({
      name: 'ทิ้งถังขยะทั่วไป',
      description: 'ล้างกล่องโฟมก่อนทิ้ง ทิ้งในถังขยะทั่วไป',
      wastesid: Number(wasteFoam.id),
    }),
  ]);
  console.log(`  ✅ Created ${sortings.length} waste sorting entries\n`);

  // ============================================================
  // 6. MATERIAL GUIDES
  // ============================================================
  console.log('📖 Seeding Material Guides...');
  const guideRepo = dataSource.getRepository(MaterialGuide);

  const guides = await guideRepo.save([
    // Single material guides (scanned waste)
    guideRepo.create({
      recommendation:
        'ล้างขวดให้สะอาด แกะฉลากออก บีบให้แบน ส่งขายร้านรับซื้อของเก่า',
      weight: 0.03,
      waste_meterialid: Number(matPET.id),
      wastesid: Number(wasteBottle.id),
    }),
    guideRepo.create({
      recommendation:
        'พับกล่องให้แบน มัดรวมกัน ส่งขายร้านรับซื้อของเก่าหรือบริจาค',
      weight: 0.15,
      waste_meterialid: Number(matPaper.id),
      wastesid: Number(wasteBox.id),
    }),
    guideRepo.create({
      recommendation: 'ล้างขวดให้สะอาด แยกฝาออก ส่งศูนย์รีไซเคิล',
      weight: 0.25,
      waste_meterialid: Number(matGlass.id),
      wastesid: Number(wasteGlass.id),
    }),
    guideRepo.create({
      recommendation: 'ล้างกระป๋อง บีบให้แบน ส่งขายร้านรับซื้อโลหะ',
      weight: 0.015,
      waste_meterialid: Number(matAluminum.id),
      wastesid: Number(wasteCan.id),
    }),
    guideRepo.create({
      recommendation: 'ทำปุ๋ยหมัก หรือทิ้งที่ถังขยะอินทรีย์',
      weight: 0.2,
      waste_meterialid: Number(matFood.id),
      wastesid: Number(wasteFruit.id),
    }),
    guideRepo.create({
      recommendation: 'หลีกเลี่ยงการใช้ ใช้ภาชนะทดแทน ทิ้งขยะทั่วไป',
      weight: 0.01,
      waste_meterialid: Number(matFoam.id),
      wastesid: Number(wasteFoam.id),
    }),
    // Composite material guide: wasteJuiceBottle has both glass and plastic (label)
    guideRepo.create({
      recommendation:
        'ล้างขวดให้สะอาด แกะฉลากพลาสติกออก แยกส่งรีไซเคิลตามประเภท',
      weight: 0.22,
      waste_meterialid: Number(matGlass.id),
      wastesid: Number(wasteJuiceBottle.id),
    }),
    guideRepo.create({
      recommendation: 'ฉลากพลาสติก: แกะออกจากขวดแก้ว ทิ้งถังรีไซเคิลพลาสติก',
      weight: 0.005,
      waste_meterialid: Number(matPET.id),
      wastesid: Number(wasteJuiceBottle.id),
    }),
  ]);
  console.log(`  ✅ Created ${guides.length} material guides\n`);

  // ============================================================
  // 7. WASTE MANAGEMENT METHODS
  // ============================================================
  console.log('🏭 Seeding Waste Management Methods...');
  const methodRepo = dataSource.getRepository(WasteManagementMethod);

  const methods = await methodRepo.save([
    methodRepo.create({
      name: 'รีไซเคิล (Recycle)',
      transport_km: 15.0,
      transport_co2e_per_km: 0.21,
    }),
    methodRepo.create({
      name: 'ฝังกลบ (Landfill)',
      transport_km: 30.0,
      transport_co2e_per_km: 0.25,
    }),
    methodRepo.create({
      name: 'เผา (Incineration)',
      transport_km: 25.0,
      transport_co2e_per_km: 0.23,
    }),
    methodRepo.create({
      name: 'ทำปุ๋ยหมัก (Composting)',
      transport_km: 5.0,
      transport_co2e_per_km: 0.15,
    }),
  ]);

  const methodRecycle = methods[0];
  // methods[1] = ฝังกลบ (Landfill)
  // methods[2] = เผา (Incineration)
  const methodCompost = methods[3];
  console.log(`  ✅ Created ${methods.length} waste management methods\n`);

  // ============================================================
  // 8. WASTE HISTORY
  // ============================================================
  console.log('📊 Seeding Waste History...');
  const historyRepo = dataSource.getRepository(WasteHistory);

  // Note: New carbon calculation logic
  // - Scanned waste (record_type: 'scan'): Uses MaterialGuide for calculation
  //   - Waste with MaterialGuides: Use guide weights and material emission factors
  //   - Waste without MaterialGuides: Fall back to direct WasteMaterial
  // - Manual entry (record_type: 'manual'): Uses WasteMaterial directly

  const histories = await historyRepo.save([
    // ============================================================
    // SCANNED WASTE TEST CASES (use MaterialGuide)
    // ============================================================

    // Scan 1: Water bottle (has MaterialGuide) - Uses guide weight (0.03 kg) + PET emission
    historyRepo.create({
      amount: 10, // 10 bottles scanned
      record_type: 'scan',
      waste_meterialid: Number(matPET.id),
      wastesid: Number(wasteBottle.id),
      userid: savedUser.id as unknown as number,
      calculation_status: 'completed',
      // Carbon = (amount * guide_weight * emissionFactor) + transport
      // 10 * 0.03 * 2.29 + 15.0 * 0.21 = 0.687 + 3.15 = 3.837
      carbon_footprint: 10 * 0.03 * 2.29 + 15.0 * 0.21,
      retry_count: 0,
    }),

    // Scan 2: Cardboard box (has MaterialGuide) - Uses guide weight (0.15 kg)
    historyRepo.create({
      amount: 5, // 5 boxes
      record_type: 'scan',
      waste_meterialid: Number(matPaper.id),
      wastesid: Number(wasteBox.id),
      userid: savedUser.id as unknown as number,
      calculation_status: 'completed',
      // 5 * 0.15 * 1.17 + 15.0 * 0.21 = 0.8775 + 3.15 = 4.0275
      carbon_footprint: 5 * 0.15 * 1.17 + 15.0 * 0.21,
      retry_count: 0,
    }),

    // Scan 3: Glass bottle (has MaterialGuide) - Uses guide weight (0.25 kg)
    historyRepo.create({
      amount: 4, // 4 bottles
      record_type: 'scan',
      waste_meterialid: Number(matGlass.id),
      wastesid: Number(wasteGlass.id),
      userid: savedUser.id as unknown as number,
      calculation_status: 'completed',
      // 4 * 0.25 * 0.86 + 15.0 * 0.21 = 0.86 + 3.15 = 4.01
      carbon_footprint: 4 * 0.25 * 0.86 + 15.0 * 0.21,
      retry_count: 0,
    }),

    // Scan 4: Composite material - Juice bottle with MULTIPLE guides (glass + plastic label)
    // This tests the composite material scenario where waste has multiple material guides
    historyRepo.create({
      amount: 3, // 3 juice bottles
      record_type: 'scan',
      waste_meterialid: Number(matGlass.id), // Primary material
      wastesid: Number(wasteJuiceBottle.id),
      userid: savedAdmin.id as unknown as number,
      calculation_status: 'pending', // Pending calculation (multiple materials)
      retry_count: 0,
    }),

    // Scan 5: Styrofoam (has MaterialGuide) - pending calculation
    historyRepo.create({
      amount: 8,
      record_type: 'scan',
      waste_meterialid: Number(matFoam.id),
      wastesid: Number(wasteFoam.id),
      userid: savedUser.id as unknown as number,
      calculation_status: 'pending',
      retry_count: 0,
    }),

    // ============================================================
    // MANUAL ENTRY TEST CASES (use WasteMaterial directly)
    // ============================================================

    // Manual 1: Direct PET material entry (no dependency on MaterialGuide)
    historyRepo.create({
      amount: 2.5, // Direct weight in kg
      record_type: 'manual',
      waste_meterialid: Number(matPET.id),
      wastesid: null, // Manual entry can have null waste reference
      userid: savedUser.id as unknown as number,
      calculation_status: 'completed',
      // Carbon = amount * emissionFactor + transport
      // 2.5 * 2.29 + 15.0 * 0.21 = 5.725 + 3.15 = 8.875
      carbon_footprint: 2.5 * 2.29 + 15.0 * 0.21,
      retry_count: 0,
    }),

    // Manual 2: Paper material entry
    historyRepo.create({
      amount: 1.5,
      record_type: 'manual',
      waste_meterialid: Number(matPaper.id),
      wastesid: null,
      userid: savedUser.id as unknown as number,
      calculation_status: 'completed',
      // 1.5 * 1.17 + 15.0 * 0.21 = 1.755 + 3.15 = 4.905
      carbon_footprint: 1.5 * 1.17 + 15.0 * 0.21,
      retry_count: 0,
    }),

    // Manual 3: Aluminum can entry
    historyRepo.create({
      amount: 0.8,
      record_type: 'manual',
      waste_meterialid: Number(matAluminum.id),
      wastesid: Number(wasteCan.id), // Can optionally reference a waste
      userid: savedAdmin.id as unknown as number,
      calculation_status: 'completed',
      // 0.8 * 8.14 + 15.0 * 0.21 = 6.512 + 3.15 = 9.662
      carbon_footprint: 0.8 * 8.14 + 15.0 * 0.21,
      retry_count: 0,
    }),

    // Manual 4: Food waste (composting method)
    historyRepo.create({
      amount: 3.0,
      record_type: 'manual',
      waste_meterialid: Number(matFood.id),
      wastesid: null,
      userid: savedAdmin.id as unknown as number,
      calculation_status: 'completed',
      // 3.0 * 0.58 + 5.0 * 0.15 = 1.74 + 0.75 = 2.49 (composting transport)
      carbon_footprint: 3.0 * 0.58 + 5.0 * 0.15,
      retry_count: 0,
    }),

    // Manual 5: Waste WITHOUT MaterialGuide (snack bag - manual only)
    // This tests manual entry for waste that has no scan data
    historyRepo.create({
      amount: 0.5,
      record_type: 'manual',
      waste_meterialid: Number(matFoam.id), // Using foam as proxy for snack packaging
      wastesid: Number(wasteSnackBag.id),
      userid: savedUser.id as unknown as number,
      calculation_status: 'pending',
      retry_count: 0,
    }),

    // Manual 6: Milk box (no MaterialGuide) - pending
    historyRepo.create({
      amount: 2.0,
      record_type: 'manual',
      waste_meterialid: Number(matPaper.id),
      wastesid: Number(wasteMilkBox.id),
      userid: savedAdmin.id as unknown as number,
      calculation_status: 'pending',
      retry_count: 0,
    }),
  ]);
  console.log(`  ✅ Created ${histories.length} waste history records\n`);

  // ============================================================
  // 9. WASTE CALCULATE LOGS
  // ============================================================
  console.log('🔢 Seeding Waste Calculate Logs...');
  const calcLogRepo = dataSource.getRepository(WasteCalculateLog);

  // Calculate logs for completed history entries
  // Note: Histories with 'pending' status don't have calc logs yet

  const calcLogs = await calcLogRepo.save([
    // Log 1: Scanned PET bottles (10 bottles * 0.03kg * 2.29 + transport)
    calcLogRepo.create({
      waste_historyid: Number(histories[0].id),
      waste_management_methodid: Number(methodRecycle.id),
      amount: 10,
      material_emission: 10 * 0.03 * 2.29, // 0.687 (using MaterialGuide weight)
      transport_emission: 15.0 * 0.21, // 3.15
      total_carbon_footprint: 10 * 0.03 * 2.29 + 15.0 * 0.21, // 3.837
    }),
    // Log 2: Scanned paper boxes (5 boxes * 0.15kg * 1.17 + transport)
    calcLogRepo.create({
      waste_historyid: Number(histories[1].id),
      waste_management_methodid: Number(methodRecycle.id),
      amount: 5,
      material_emission: 5 * 0.15 * 1.17, // 0.8775 (using MaterialGuide weight)
      transport_emission: 15.0 * 0.21, // 3.15
      total_carbon_footprint: 5 * 0.15 * 1.17 + 15.0 * 0.21, // 4.0275
    }),
    // Log 3: Scanned glass bottles (4 bottles * 0.25kg * 0.86 + transport)
    calcLogRepo.create({
      waste_historyid: Number(histories[2].id),
      waste_management_methodid: Number(methodRecycle.id),
      amount: 4,
      material_emission: 4 * 0.25 * 0.86, // 0.86 (using MaterialGuide weight)
      transport_emission: 15.0 * 0.21, // 3.15
      total_carbon_footprint: 4 * 0.25 * 0.86 + 15.0 * 0.21, // 4.01
    }),
    // Log 4: Manual PET entry (direct weight 2.5kg * 2.29 + transport)
    calcLogRepo.create({
      waste_historyid: Number(histories[5].id),
      waste_management_methodid: Number(methodRecycle.id),
      amount: 2.5,
      material_emission: 2.5 * 2.29, // 5.725 (direct material weight)
      transport_emission: 15.0 * 0.21, // 3.15
      total_carbon_footprint: 2.5 * 2.29 + 15.0 * 0.21, // 8.875
    }),
    // Log 5: Manual paper entry (direct weight 1.5kg * 1.17 + transport)
    calcLogRepo.create({
      waste_historyid: Number(histories[6].id),
      waste_management_methodid: Number(methodRecycle.id),
      amount: 1.5,
      material_emission: 1.5 * 1.17, // 1.755
      transport_emission: 15.0 * 0.21, // 3.15
      total_carbon_footprint: 1.5 * 1.17 + 15.0 * 0.21, // 4.905
    }),
    // Log 6: Manual aluminum entry (direct weight 0.8kg * 8.14 + transport)
    calcLogRepo.create({
      waste_historyid: Number(histories[7].id),
      waste_management_methodid: Number(methodRecycle.id),
      amount: 0.8,
      material_emission: 0.8 * 8.14, // 6.512
      transport_emission: 15.0 * 0.21, // 3.15
      total_carbon_footprint: 0.8 * 8.14 + 15.0 * 0.21, // 9.662
    }),
    // Log 7: Manual food waste (composting - direct weight 3.0kg * 0.58 + compost transport)
    calcLogRepo.create({
      waste_historyid: Number(histories[8].id),
      waste_management_methodid: Number(methodCompost.id),
      amount: 3.0,
      material_emission: 3.0 * 0.58, // 1.74
      transport_emission: 5.0 * 0.15, // 0.75 (composting transport)
      total_carbon_footprint: 3.0 * 0.58 + 5.0 * 0.15, // 2.49
    }),
  ]);
  console.log(`  ✅ Created ${calcLogs.length} waste calculate logs\n`);

  // ============================================================
  // 10. SCHEDULER SETTINGS
  // ============================================================
  console.log('⚙️  Seeding Scheduler Settings...');
  const settingsRepo = dataSource.getRepository(SchedulerSettings);

  const settings = await settingsRepo.save([
    settingsRepo.create({
      key: 'carbon_footprint_cron',
      value: '*/5 * * * *',
      label: 'Carbon Footprint Cron Schedule',
      description:
        'Cron expression สำหรับ scheduler คำนวณ Carbon Footprint (ทุก 5 นาที)',
      type: 'string',
    }),
    settingsRepo.create({
      key: 'carbon_footprint_batch_size',
      value: '50',
      label: 'Batch Size',
      description: 'จำนวนรายการที่ต้องคำนวณต่อครั้ง',
      type: 'number',
    }),
    settingsRepo.create({
      key: 'carbon_footprint_max_retries',
      value: '3',
      label: 'Max Retries',
      description: 'จำนวนครั้งสูงสุดที่จะ retry เมื่อคำนวณล้มเหลว',
      type: 'number',
    }),
  ]);
  console.log(`  ✅ Created ${settings.length} scheduler settings\n`);

  // ============================================================
  // 11. SCHEDULER LOCK
  // ============================================================
  console.log('🔒 Seeding Scheduler Lock...');
  const lockRepo = dataSource.getRepository(SchedulerLock);

  await lockRepo.save(
    lockRepo.create({
      name: 'carbon_footprint_calculation',
      is_locked: false,
      locked_by: undefined,
    }),
  );
  console.log(`  ✅ Created 1 scheduler lock\n`);

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('═'.repeat(50));
  console.log('🎉 Database seeding completed successfully!');
  console.log('═'.repeat(50));
  console.log('');
  console.log('📋 Summary:');
  console.log(`   👤 Users:                   2 (admin + 1 user)`);
  console.log(`   📦 Waste Categories:        ${categories.length}`);
  console.log(`   🧪 Waste Materials:         ${materials.length}`);
  console.log(
    `   🗑️  Wastes:                  ${wastes.length + manualWastes.length} (${wastes.length} with guides + ${manualWastes.length} manual-only)`,
  );
  console.log(`   ♻️  Waste Sorting:            ${sortings.length}`);
  console.log(
    `   📖 Material Guides:         ${guides.length} (includes 2 composite guides)`,
  );
  console.log(`   🏭 Management Methods:      ${methods.length}`);
  console.log(
    `   📊 Waste History:           ${histories.length} (${histories.filter((h) => h.record_type === 'scan').length} scan + ${histories.filter((h) => h.record_type === 'manual').length} manual)`,
  );
  console.log(`   🔢 Calculate Logs:          ${calcLogs.length}`);
  console.log(`   ⚙️  Scheduler Settings:      ${settings.length}`);
  console.log(`   🔒 Scheduler Locks:         1`);
  console.log('');
  console.log('🧪 Test Coverage:');
  console.log('   ✅ Scanned waste with MaterialGuide (single material)');
  console.log('   ✅ Scanned waste with composite materials (multiple guides)');
  console.log('   ✅ Manual entry with WasteMaterial (direct)');
  console.log('   ✅ Manual entry for waste without MaterialGuide');
  console.log('');
  console.log('🔑 Admin Login:');
  console.log('   Email:    admin@informatics.buu.ac.th');
  console.log('   Password: Admin@1234');
  console.log('');
}
