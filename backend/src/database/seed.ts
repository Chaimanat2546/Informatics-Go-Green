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
      emission_factor: 2.29,
      unit: 'kg CO₂e/kg',
      waste_categoriesid: Number(catRecycle.id),
    }),
    materialRepo.create({
      name: 'กระดาษ',
      emission_factor: 1.17,
      unit: 'kg CO₂e/kg',
      waste_categoriesid: Number(catRecycle.id),
    }),
    materialRepo.create({
      name: 'แก้ว',
      emission_factor: 0.86,
      unit: 'kg CO₂e/kg',
      waste_categoriesid: Number(catRecycle.id),
    }),
    materialRepo.create({
      name: 'อลูมิเนียม',
      emission_factor: 8.14,
      unit: 'kg CO₂e/kg',
      waste_categoriesid: Number(catRecycle.id),
    }),
    materialRepo.create({
      name: 'เศษอาหาร',
      emission_factor: 0.58,
      unit: 'kg CO₂e/kg',
      waste_categoriesid: Number(catOrganic.id),
    }),
    materialRepo.create({
      name: 'ถ่านไฟฉาย / แบตเตอรี่',
      emission_factor: 3.50,
      unit: 'kg CO₂e/kg',
      waste_categoriesid: Number(catHazardous.id),
    }),
    materialRepo.create({
      name: 'โฟม (Styrofoam)',
      emission_factor: 3.30,
      unit: 'kg CO₂e/kg',
      waste_categoriesid: Number(catGeneral.id),
    }),
    materialRepo.create({
      name: 'ผ้า / สิ่งทอ',
      emission_factor: 1.50,
      unit: 'kg CO₂e/kg',
      waste_categoriesid: Number(catGeneral.id),
    }),
  ]);

  const [matPET, matPaper, matGlass, matAluminum, matFood, matBattery, matFoam, matFabric] = materials;
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
      waste_categoriesid: Number(catRecycle.id),
    }),
    wasteRepo.create({
      name: 'กล่องกระดาษ',
      barcode: 8851028002020,
      waste_categoriesid: Number(catRecycle.id),
    }),
    wasteRepo.create({
      name: 'ขวดแก้ว',
      barcode: 8851028003030,
      waste_categoriesid: Number(catRecycle.id),
    }),
    wasteRepo.create({
      name: 'กระป๋องอลูมิเนียม',
      barcode: 8851028004040,
      waste_categoriesid: Number(catRecycle.id),
    }),
    wasteRepo.create({
      name: 'เปลือกผลไม้',
      waste_categoriesid: Number(catOrganic.id),
    }),
    wasteRepo.create({
      name: 'กล่องโฟมใส่อาหาร',
      waste_categoriesid: Number(catGeneral.id),
    }),
  ]);

  const [wasteBottle, wasteBox, wasteGlass, wasteCan, wasteFruit, wasteFoam] = wastes;
  console.log(`  ✅ Created ${wastes.length} wastes\n`);

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
    guideRepo.create({
      recommendation: 'ล้างขวดให้สะอาด แกะฉลากออก บีบให้แบน ส่งขายร้านรับซื้อของเก่า',
      weight: 0.03,
      waste_meterialid: Number(matPET.id),
      wastesid: Number(wasteBottle.id),
    }),
    guideRepo.create({
      recommendation: 'พับกล่องให้แบน มัดรวมกัน ส่งขายร้านรับซื้อของเก่าหรือบริจาค',
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

  const [methodRecycle, methodLandfill, methodIncineration, methodCompost] = methods;
  console.log(`  ✅ Created ${methods.length} waste management methods\n`);

  // ============================================================
  // 8. WASTE HISTORY
  // ============================================================
  console.log('📊 Seeding Waste History...');
  const historyRepo = dataSource.getRepository(WasteHistory);

  const histories = await historyRepo.save([
    historyRepo.create({
      amount: 2.5,
      record_type: 'manual',
      waste_meterialid: Number(matPET.id),
      wastesid: Number(wasteBottle.id),
      userid: savedUser.id as any,
      calculation_status: 'completed',
      carbon_footprint: 2.5 * 2.29 + 15.0 * 0.21,  // 5.725 + 3.15 = 8.875
      retry_count: 0,
    }),
    historyRepo.create({
      amount: 1.0,
      record_type: 'manual',
      waste_meterialid: Number(matPaper.id),
      wastesid: Number(wasteBox.id),
      userid: savedUser.id as any,
      calculation_status: 'completed',
      carbon_footprint: 1.0 * 1.17 + 15.0 * 0.21,  // 1.17 + 3.15 = 4.32
      retry_count: 0,
    }),
    historyRepo.create({
      amount: 3.0,
      record_type: 'scan',
      waste_meterialid: Number(matGlass.id),
      wastesid: Number(wasteGlass.id),
      userid: savedUser.id as any,
      calculation_status: 'completed',
      carbon_footprint: 3.0 * 0.86 + 15.0 * 0.21,  // 2.58 + 3.15 = 5.73
      retry_count: 0,
    }),
    historyRepo.create({
      amount: 0.5,
      record_type: 'manual',
      waste_meterialid: Number(matAluminum.id),
      wastesid: Number(wasteCan.id),
      userid: savedAdmin.id as any,
      calculation_status: 'completed',
      carbon_footprint: 0.5 * 8.14 + 15.0 * 0.21,  // 4.07 + 3.15 = 7.22
      retry_count: 0,
    }),
    historyRepo.create({
      amount: 5.0,
      record_type: 'manual',
      waste_meterialid: Number(matFood.id),
      wastesid: Number(wasteFruit.id),
      userid: savedAdmin.id as any,
      calculation_status: 'completed',
      carbon_footprint: 5.0 * 0.58 + 5.0 * 0.15,  // 2.9 + 0.75 = 3.65
      retry_count: 0,
    }),
    historyRepo.create({
      amount: 0.2,
      record_type: 'scan',
      waste_meterialid: Number(matFoam.id),
      wastesid: Number(wasteFoam.id),
      userid: savedUser.id as any,
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

  const calcLogs = await calcLogRepo.save([
    calcLogRepo.create({
      waste_historyid: Number(histories[0].id),
      waste_management_methodid: Number(methodRecycle.id),
      amount: 2.5,
      material_emission: 2.5 * 2.29,       // 5.725
      transport_emission: 15.0 * 0.21,      // 3.15
      total_carbon_footprint: 2.5 * 2.29 + 15.0 * 0.21,  // 8.875
    }),
    calcLogRepo.create({
      waste_historyid: Number(histories[1].id),
      waste_management_methodid: Number(methodRecycle.id),
      amount: 1.0,
      material_emission: 1.0 * 1.17,
      transport_emission: 15.0 * 0.21,
      total_carbon_footprint: 1.0 * 1.17 + 15.0 * 0.21,
    }),
    calcLogRepo.create({
      waste_historyid: Number(histories[2].id),
      waste_management_methodid: Number(methodRecycle.id),
      amount: 3.0,
      material_emission: 3.0 * 0.86,
      transport_emission: 15.0 * 0.21,
      total_carbon_footprint: 3.0 * 0.86 + 15.0 * 0.21,
    }),
    calcLogRepo.create({
      waste_historyid: Number(histories[3].id),
      waste_management_methodid: Number(methodRecycle.id),
      amount: 0.5,
      material_emission: 0.5 * 8.14,
      transport_emission: 15.0 * 0.21,
      total_carbon_footprint: 0.5 * 8.14 + 15.0 * 0.21,
    }),
    calcLogRepo.create({
      waste_historyid: Number(histories[4].id),
      waste_management_methodid: Number(methodCompost.id),
      amount: 5.0,
      material_emission: 5.0 * 0.58,
      transport_emission: 5.0 * 0.15,
      total_carbon_footprint: 5.0 * 0.58 + 5.0 * 0.15,
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
      description: 'Cron expression สำหรับ scheduler คำนวณ Carbon Footprint (ทุก 5 นาที)',
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
  console.log(`   🗑️  Wastes:                  ${wastes.length}`);
  console.log(`   ♻️  Waste Sorting:            ${sortings.length}`);
  console.log(`   📖 Material Guides:         ${guides.length}`);
  console.log(`   🏭 Management Methods:      ${methods.length}`);
  console.log(`   📊 Waste History:           ${histories.length}`);
  console.log(`   🔢 Calculate Logs:          ${calcLogs.length}`);
  console.log(`   ⚙️  Scheduler Settings:      ${settings.length}`);
  console.log(`   🔒 Scheduler Locks:         1`);
  console.log('');
  console.log('🔑 Admin Login:');
  console.log('   Email:    admin@informatics.buu.ac.th');
  console.log('   Password: Admin@1234');
  console.log('');
}
