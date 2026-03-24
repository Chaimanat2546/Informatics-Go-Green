"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv = require("dotenv");
const _1710000000000_CreateSchedulerSettings_1 = require("./migrations/1710000000000-CreateSchedulerSettings");
dotenv.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'informatics_go_green',
    entities: [__dirname + '/**/*.entity.js'],
    migrations: [_1710000000000_CreateSchedulerSettings_1.CreateSchedulerSettings1710000000000],
    migrationsRun: false,
    synchronize: false,
    logging: false,
});
