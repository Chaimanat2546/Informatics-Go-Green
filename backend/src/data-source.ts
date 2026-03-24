import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { CreateSchedulerSettings1710000000000 } from './migrations/1710000000000-CreateSchedulerSettings';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'informatics_go_green',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [CreateSchedulerSettings1710000000000],
  migrationsRun: false,
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
});
