import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { seedDatabase } from './seed';

// Load environment variables
config();

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

async function runSeeder() {
  console.log('🔌 Connecting to database...');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'informatics_go_green',
    entities: [
      User,
      WasteCategory,
      WasteMaterial,
      Waste,
      WasteHistory,
      WasteSorting,
      MaterialGuide,
      WasteCalculateLog,
      WasteManagementMethod,
      SchedulerSettings,
      SchedulerLock,
    ],
    synchronize: false, // Don't auto-sync in seed script
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected successfully!');

    await seedDatabase(dataSource);

    await dataSource.destroy();
    console.log('👋 Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running seeder:', error);
    process.exit(1);
  }
}

void runSeeder();
