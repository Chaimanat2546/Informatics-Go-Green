import { DataSource } from 'typeorm';
import { WasteCategory } from '../waste/entities/waste-category.entity';
import { WasteMaterial } from '../waste/entities/waste-material.entity';
import { Waste } from '../waste/entities/waste.entity';
import { WasteSorting } from '../waste/entities/waste-sorting.entity';
import { MaterialGuide } from '../waste/entities/material-guide.entity';
import { WasteManagementMethod } from '../waste/entities/waste-management-method.entity';
import { SchedulerSettings } from '../scheduler/entities/scheduler-settings.entity';

export async function seedDatabase(dataSource: DataSource): Promise<void> {
  console.log('🌱 Starting database seeding...');

  // Get repositories
  const categoryRepo = dataSource.getRepository(WasteCategory);
  const materialRepo = dataSource.getRepository(WasteMaterial);
  const wasteRepo = dataSource.getRepository(Waste);
  const sortingRepo = dataSource.getRepository(WasteSorting);
  const guideRepo = dataSource.getRepository(MaterialGuide);
  const methodRepo = dataSource.getRepository(WasteManagementMethod);
  const settingsRepo = dataSource.getRepository(SchedulerSettings);

  // ==========================================
  // 1. Seed Waste Categories
  // ==========================================
  console.log('📁 Seeding waste categories...');
  const existingCategories = await categoryRepo.count();
  if (existingCategories === 0) {
    const categories = categoryRepo.create([
      { name: 'ขยะรีไซเคิล' },
      { name: 'ขยะอินทรีย์' },
      { name: 'ขยะทั่วไป' },
      { name: 'ขยะอันตราย' },
      { name: 'ขยะติดเชื้อ' },
    ]);
    await categoryRepo.save(categories);
    console.log(`  ✅ Created ${categories.length} waste categories`);
  } else {
    console.log(
      `  ⏭️ Skipped - ${existingCategories} categories already exist`,
    );
  }

  // ==========================================
  // 2. Seed Waste Materials
  // ==========================================
  console.log('📦 Seeding waste materials...');
  const existingMaterials = await materialRepo.count();
  if (existingMaterials === 0) {
    const recycleCategory = await categoryRepo.findOne({
      where: { name: 'ขยะรีไซเคิล' },
    });
    const organicCategory = await categoryRepo.findOne({
      where: { name: 'ขยะอินทรีย์' },
    });
    const generalCategory = await categoryRepo.findOne({
      where: { name: 'ขยะทั่วไป' },
    });
    const hazardousCategory = await categoryRepo.findOne({
      where: { name: 'ขยะอันตราย' },
    });

    const materials = materialRepo.create([
      // ขยะรีไซเคิล
      {
        name: 'พลาสติก PET',
        emission_factor: 2.89,
        unit: 'kgCO2e/kg',
        waste_categoriesid: recycleCategory?.id,
      },
      {
        name: 'พลาสติก HDPE',
        emission_factor: 1.93,
        unit: 'kgCO2e/kg',
        waste_categoriesid: recycleCategory?.id,
      },
      {
        name: 'อะลูมิเนียม',
        emission_factor: 8.14,
        unit: 'kgCO2e/kg',
        waste_categoriesid: recycleCategory?.id,
      },
      {
        name: 'เหล็ก',
        emission_factor: 1.46,
        unit: 'kgCO2e/kg',
        waste_categoriesid: recycleCategory?.id,
      },
      {
        name: 'กระดาษ',
        emission_factor: 0.94,
        unit: 'kgCO2e/kg',
        waste_categoriesid: recycleCategory?.id,
      },
      {
        name: 'แก้ว',
        emission_factor: 0.87,
        unit: 'kgCO2e/kg',
        waste_categoriesid: recycleCategory?.id,
      },
      {
        name: 'กระป๋อง',
        emission_factor: 1.28,
        unit: 'kgCO2e/kg',
        waste_categoriesid: recycleCategory?.id,
      },

      // ขยะอินทรีย์
      {
        name: 'เศษอาหาร',
        emission_factor: 0.58,
        unit: 'kgCO2e/kg',
        waste_categoriesid: organicCategory?.id,
      },
      {
        name: 'เศษผัก/ผลไม้',
        emission_factor: 0.42,
        unit: 'kgCO2e/kg',
        waste_categoriesid: organicCategory?.id,
      },
      {
        name: 'ใบไม้',
        emission_factor: 0.21,
        unit: 'kgCO2e/kg',
        waste_categoriesid: organicCategory?.id,
      },

      // ขยะทั่วไป
      {
        name: 'ถุงพลาสติก',
        emission_factor: 3.1,
        unit: 'kgCO2e/kg',
        waste_categoriesid: generalCategory?.id,
      },
      {
        name: 'โฟม',
        emission_factor: 3.29,
        unit: 'kgCO2e/kg',
        waste_categoriesid: generalCategory?.id,
      },
      {
        name: 'ผ้า/เสื้อผ้า',
        emission_factor: 1.5,
        unit: 'kgCO2e/kg',
        waste_categoriesid: generalCategory?.id,
      },

      // ขยะอันตราย
      {
        name: 'แบตเตอรี่',
        emission_factor: 4.65,
        unit: 'kgCO2e/kg',
        waste_categoriesid: hazardousCategory?.id,
      },
      {
        name: 'หลอดไฟ',
        emission_factor: 2.11,
        unit: 'kgCO2e/kg',
        waste_categoriesid: hazardousCategory?.id,
      },
      {
        name: 'อุปกรณ์อิเล็กทรอนิกส์',
        emission_factor: 5.2,
        unit: 'kgCO2e/kg',
        waste_categoriesid: hazardousCategory?.id,
      },
    ]);
    await materialRepo.save(materials);
    console.log(`  ✅ Created ${materials.length} waste materials`);
  } else {
    console.log(`  ⏭️ Skipped - ${existingMaterials} materials already exist`);
  }

  // ==========================================
  // 3. Seed Waste Management Methods
  // ==========================================
  console.log('🚚 Seeding waste management methods...');
  const existingMethods = await methodRepo.count();
  if (existingMethods === 0) {
    const methods = methodRepo.create([
      { name: 'เตาเผาขยะ', transport_km: 15.0, transport_co2e_per_km: 0.12 },
      { name: 'ฝังกลบ', transport_km: 25.0, transport_co2e_per_km: 0.12 },
      { name: 'รีไซเคิล', transport_km: 30.0, transport_co2e_per_km: 0.1 },
      { name: 'ทำปุ๋ยหมัก', transport_km: 10.0, transport_co2e_per_km: 0.08 },
      { name: 'บำบัดน้ำเสีย', transport_km: 20.0, transport_co2e_per_km: 0.15 },
    ]);
    await methodRepo.save(methods);
    console.log(`  ✅ Created ${methods.length} management methods`);
  } else {
    console.log(`  ⏭️ Skipped - ${existingMethods} methods already exist`);
  }

  // ==========================================
  // 4. Seed Sample Wastes
  // ==========================================
  console.log('🗑️ Seeding sample wastes...');
  const existingWastes = await wasteRepo.count();
  if (existingWastes === 0) {
    const recycleCategory = await categoryRepo.findOne({
      where: { name: 'ขยะรีไซเคิล' },
    });
    const organicCategory = await categoryRepo.findOne({
      where: { name: 'ขยะอินทรีย์' },
    });
    const generalCategory = await categoryRepo.findOne({
      where: { name: 'ขยะทั่วไป' },
    });

    const wastes = wasteRepo.create([
      { name: 'ขวดน้ำพลาสติก', waste_categoriesid: recycleCategory?.id },
      { name: 'กระป๋องเบียร์', waste_categoriesid: recycleCategory?.id },
      { name: 'กล่องกระดาษ', waste_categoriesid: recycleCategory?.id },
      { name: 'ขวดแก้ว', waste_categoriesid: recycleCategory?.id },
      { name: 'เศษอาหารจากครัว', waste_categoriesid: organicCategory?.id },
      { name: 'เปลือกผลไม้', waste_categoriesid: organicCategory?.id },
      { name: 'ถุงขนม', waste_categoriesid: generalCategory?.id },
      { name: 'กล่องโฟม', waste_categoriesid: generalCategory?.id },
    ]);
    await wasteRepo.save(wastes);
    console.log(`  ✅ Created ${wastes.length} sample wastes`);
  } else {
    console.log(`  ⏭️ Skipped - ${existingWastes} wastes already exist`);
  }

  // ==========================================
  // 5. Seed Waste Sorting
  // ==========================================
  console.log('🔄 Seeding waste sorting methods...');
  const existingSorting = await sortingRepo.count();
  if (existingSorting === 0) {
    const bottle = await wasteRepo.findOne({
      where: { name: 'ขวดน้ำพลาสติก' },
    });
    const can = await wasteRepo.findOne({ where: { name: 'กระป๋องเบียร์' } });
    const paper = await wasteRepo.findOne({ where: { name: 'กล่องกระดาษ' } });

    const sortings = sortingRepo.create([
      {
        name: 'ล้างทำความสะอาด',
        description: 'ล้างขวดให้สะอาดก่อนทิ้ง',
        wastesid: bottle?.id,
      },
      {
        name: 'แกะฉลาก',
        description: 'แกะฉลากพลาสติกออก',
        wastesid: bottle?.id,
      },
      {
        name: 'บีบแบน',
        description: 'บีบให้แบนเพื่อประหยัดพื้นที่',
        wastesid: can?.id,
      },
      {
        name: 'พับให้เรียบ',
        description: 'พับกระดาษให้เรียบร้อย',
        wastesid: paper?.id,
      },
    ]);
    await sortingRepo.save(sortings);
    console.log(`  ✅ Created ${sortings.length} sorting methods`);
  } else {
    console.log(
      `  ⏭️ Skipped - ${existingSorting} sorting methods already exist`,
    );
  }

  // ==========================================
  // 6. Seed Material Guides
  // ==========================================
  console.log('📚 Seeding material guides...');
  const existingGuides = await guideRepo.count();
  if (existingGuides === 0) {
    const petMaterial = await materialRepo.findOne({
      where: { name: 'พลาสติก PET' },
    });
    const aluminum = await materialRepo.findOne({
      where: { name: 'อะลูมิเนียม' },
    });
    const paper = await materialRepo.findOne({ where: { name: 'กระดาษ' } });
    const food = await materialRepo.findOne({ where: { name: 'เศษอาหาร' } });

    const bottle = await wasteRepo.findOne({
      where: { name: 'ขวดน้ำพลาสติก' },
    });
    const can = await wasteRepo.findOne({ where: { name: 'กระป๋องเบียร์' } });
    const paperBox = await wasteRepo.findOne({
      where: { name: 'กล่องกระดาษ' },
    });
    const foodWaste = await wasteRepo.findOne({
      where: { name: 'เศษอาหารจากครัว' },
    });

    const guides = guideRepo.create([
      {
        recommendation: 'ล้างให้สะอาด แกะฉลาก บีบแบน แล้วทิ้งในถังรีไซเคิล',
        weight: 0.02,
        waste_meterialid: petMaterial?.id,
        wastesid: bottle?.id,
      },
      {
        recommendation: 'ล้างให้สะอาด บีบแบน แล้วทิ้งในถังรีไซเคิล',
        weight: 0.015,
        waste_meterialid: aluminum?.id,
        wastesid: can?.id,
      },
      {
        recommendation: 'พับให้เรียบ มัดรวมกัน แล้วทิ้งในถังรีไซเคิล',
        weight: 0.1,
        waste_meterialid: paper?.id,
        wastesid: paperBox?.id,
      },
      {
        recommendation: 'แยกทิ้งในถังขยะอินทรีย์ สามารถนำไปทำปุ๋ยได้',
        weight: 0.5,
        waste_meterialid: food?.id,
        wastesid: foodWaste?.id,
      },
    ]);
    await guideRepo.save(guides);
    console.log(`  ✅ Created ${guides.length} material guides`);
  } else {
    console.log(`  ⏭️ Skipped - ${existingGuides} guides already exist`);
  }

  // ==========================================
  // 7. Seed Scheduler Settings (if not exist)
  // ==========================================
  console.log('⚙️ Checking scheduler settings...');
  const existingSettings = await settingsRepo.count();
  if (existingSettings === 0) {
    const settings = settingsRepo.create([
      {
        key: 'scheduler_enabled',
        value: 'true',
        label: 'เปิดใช้งาน Scheduler',
        description: 'เปิด/ปิดการคำนวณอัตโนมัติ',
        type: 'boolean',
      },
      {
        key: 'scheduler_time',
        value: '02:00',
        label: 'เวลาคำนวณ',
        description: 'เวลาที่จะทำการคำนวณอัตโนมัติ (HH:mm)',
        type: 'time',
      },
      {
        key: 'default_management_method_id',
        value: '',
        label: 'วิธีการจัดการขยะเริ่มต้น',
        description: 'เลือกวิธีการจัดการขยะที่จะใช้ในการคำนวณ',
        type: 'select',
      },
    ]);
    await settingsRepo.save(settings);
    console.log(`  ✅ Created ${settings.length} scheduler settings`);
  } else {
    console.log(`  ⏭️ Skipped - ${existingSettings} settings already exist`);
  }

  console.log('🎉 Database seeding completed successfully!');
}
