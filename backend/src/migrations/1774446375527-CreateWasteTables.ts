import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateWasteTables1774446375527 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for waste reactions
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE waste_reaction_type AS ENUM ('like', 'dislike');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // ============================================================
    // 1. waste_categories
    // ============================================================
    await queryRunner.createTable(
      new Table({
        name: 'waste_categories',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'created_at', type: 'date', default: 'CURRENT_DATE' },
          { name: 'updated_at', type: 'date', default: 'CURRENT_DATE' },
        ],
      }),
      true,
    );

    // ============================================================
    // 2. waste_meterial (matches entity typo)
    // ============================================================
    await queryRunner.createTable(
      new Table({
        name: 'waste_meterial',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar', length: '255' },
          {
            name: 'emissionFactor',
            type: 'float',
            isNullable: true,
          },
          { name: 'unit', type: 'varchar', length: '255', isNullable: true },
          { name: 'created_at', type: 'date', default: 'CURRENT_DATE' },
          { name: 'updated_at', type: 'date', default: 'CURRENT_DATE' },
          {
            name: 'meterial_image',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'waste_categoriesid',
            type: 'bigint',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'waste_meterial',
      new TableForeignKey({
        columnNames: ['waste_categoriesid'],
        referencedTableName: 'waste_categories',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // ============================================================
    // 3. wastes
    // ============================================================
    await queryRunner.createTable(
      new Table({
        name: 'wastes',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar', length: '255' },
          {
            name: 'waste_image',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          { name: 'barcode', type: 'bigint', isNullable: true },
          {
            name: 'create_at',
            type: 'date',
            default: 'CURRENT_DATE',
          },
          {
            name: 'waste_categoriesid',
            type: 'bigint',
            isNullable: true,
          },
          { name: 'userid', type: 'bigint', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'wastes',
      new TableForeignKey({
        columnNames: ['waste_categoriesid'],
        referencedTableName: 'waste_categories',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // ============================================================
    // 4. waste_management_methods
    // ============================================================
    await queryRunner.createTable(
      new Table({
        name: 'waste_management_methods',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'transport_km', type: 'float', isNullable: true },
          {
            name: 'transport_co2e_per_km',
            type: 'float',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // ============================================================
    // 5. waste_history
    // ============================================================
    await queryRunner.createTable(
      new Table({
        name: 'waste_history',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'amount', type: 'float', isNullable: true },
          {
            name: 'record_type',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'create_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'waste_meterialid',
            type: 'bigint',
            isNullable: true,
          },
          { name: 'wastesid', type: 'bigint', isNullable: true },
          { name: 'userid', type: 'bigint', isNullable: true },
          // Carbon Footprint fields
          {
            name: 'calculation_status',
            type: 'varchar',
            length: '20',
            default: "'pending'",
          },
          {
            name: 'carbon_footprint',
            type: 'float',
            isNullable: true,
          },
          { name: 'retry_count', type: 'int', default: 0 },
          {
            name: 'last_calculation_attempt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'error_message',
            type: 'text',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'waste_history',
      new TableForeignKey({
        columnNames: ['wastesid'],
        referencedTableName: 'wastes',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'waste_history',
      new TableForeignKey({
        columnNames: ['waste_meterialid'],
        referencedTableName: 'waste_meterial',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // ============================================================
    // 6. waste_sorting
    // ============================================================
    await queryRunner.createTable(
      new Table({
        name: 'waste_sorting',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar', length: '255' },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          { name: 'created_at', type: 'date', default: 'CURRENT_DATE' },
          { name: 'updated_at', type: 'date', default: 'CURRENT_DATE' },
          { name: 'wastesid', type: 'bigint', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'waste_sorting',
      new TableForeignKey({
        columnNames: ['wastesid'],
        referencedTableName: 'wastes',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // ============================================================
    // 7. material_guides
    // ============================================================
    await queryRunner.createTable(
      new Table({
        name: 'material_guides',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'guide_image',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'recommendation',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          { name: 'weight', type: 'float', isNullable: true },
          { name: 'created_at', type: 'date', default: 'CURRENT_DATE' },
          { name: 'updated_at', type: 'date', default: 'CURRENT_DATE' },
          {
            name: 'waste_meterialid',
            type: 'bigint',
            isNullable: true,
          },
          { name: 'wastesid', type: 'bigint', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'material_guides',
      new TableForeignKey({
        columnNames: ['waste_meterialid'],
        referencedTableName: 'waste_meterial',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'material_guides',
      new TableForeignKey({
        columnNames: ['wastesid'],
        referencedTableName: 'wastes',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // ============================================================
    // 8. waste_calculate_logs
    // ============================================================
    await queryRunner.createTable(
      new Table({
        name: 'waste_calculate_logs',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'create_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'waste_historyid',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'waste_management_methodid',
            type: 'int',
            isNullable: true,
          },
          { name: 'amount', type: 'float', isNullable: true },
          {
            name: 'material_emission',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'transport_emission',
            type: 'float',
            isNullable: true,
          },
          {
            name: 'total_carbon_footprint',
            type: 'float',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'waste_calculate_logs',
      new TableForeignKey({
        columnNames: ['waste_historyid'],
        referencedTableName: 'waste_history',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'waste_calculate_logs',
      new TableForeignKey({
        columnNames: ['waste_management_methodid'],
        referencedTableName: 'waste_management_methods',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // ============================================================
    // 9. waste_reactions
    // ============================================================
    await queryRunner.createTable(
      new Table({
        name: 'waste_reactions',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'wastesid', type: 'bigint' },
          { name: 'userid', type: 'varchar' },
          { name: 'reaction', type: 'waste_reaction_type' },
          {
            name: 'create_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        uniques: [
          {
            name: 'UQ_waste_reactions_wastesid_userid',
            columnNames: ['wastesid', 'userid'],
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'waste_reactions',
      new TableForeignKey({
        columnNames: ['wastesid'],
        referencedTableName: 'wastes',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // ============================================================
    // 10. scheduler_locks
    // ============================================================
    await queryRunner.createTable(
      new Table({
        name: 'scheduler_locks',
        columns: [
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isPrimary: true,
          },
          { name: 'is_locked', type: 'boolean', default: false },
          {
            name: 'locked_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'locked_by',
            type: 'varchar',
            length: '255',
            isNullable: true,
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop in reverse dependency order
    await queryRunner.dropTable('scheduler_locks', true);
    await queryRunner.dropTable('waste_reactions', true);
    await queryRunner.dropTable('waste_calculate_logs', true);
    await queryRunner.dropTable('material_guides', true);
    await queryRunner.dropTable('waste_sorting', true);
    await queryRunner.dropTable('waste_history', true);
    await queryRunner.dropTable('waste_management_methods', true);
    await queryRunner.dropTable('wastes', true);
    await queryRunner.dropTable('waste_meterial', true);
    await queryRunner.dropTable('waste_categories', true);

    // Drop enum type
    await queryRunner.query(`DROP TYPE IF EXISTS waste_reaction_type`);
  }
}
