import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateSchedulerSettings1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'scheduler_settings',
        columns: [
          { name: 'key', type: 'varchar', length: '100', isPrimary: true },
          { name: 'value', type: 'varchar', length: '255' },
          { name: 'label', type: 'varchar', length: '255', isNullable: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'type', type: 'varchar', length: '50', default: "'string'" },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Insert default settings for carbon footprint calculation
    await queryRunner.query(`
      INSERT INTO scheduler_settings (key, value, label, description, type) VALUES 
      ('cron_time', '02:00', 'เวลาคำนวณอัตโนมัติ', 'เวลาที่ระบบจะคำนวณ Carbon Footprint อัตโนมัติ (รูปแบบ HH:mm)', 'time'),
      ('auto_calculate_enabled', 'true', 'เปิดใช้งานการคำนวณอัตโนมัติ', 'เปิด/ปิดการคำนวณอัตโนมัติรายวัน', 'boolean'),
      ('default_management_method_id', '', 'วิธีการจัดการขยะที่ใช้คำนวณ', 'เลือกวิธีการจัดการขยะที่จะใช้คำนวณ Transport Emission', 'select')
      ON CONFLICT (key) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('scheduler_settings');
  }
}
