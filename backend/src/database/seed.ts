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
  // SUMMARY
  // ============================================================
  console.log('═'.repeat(50));
  console.log('🎉 Database seeding (Users Only) completed successfully!');
  console.log('═'.repeat(50));
  console.log('');
  console.log('📋 Summary:');
  console.log(`   👤 Users:                   2 (admin + 1 user)`);
  console.log('');
  console.log('🔑 Admin Login:');
  console.log('   Email:    admin@informatics.buu.ac.th');
  console.log('   Password: Admin@1234');
  console.log('');
}
