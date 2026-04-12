import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1774446375526 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create extension for UUID generation
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'email', type: 'varchar', isUnique: true },
          { name: 'password', type: 'varchar', isNullable: true },
          { name: 'firstName', type: 'varchar' },
          { name: 'lastName', type: 'varchar' },
          { name: 'phoneNumber', type: 'varchar', isNullable: true },
          { name: 'province', type: 'varchar', isNullable: true },
          { name: 'profilePicture', type: 'varchar', isNullable: true },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'role', type: 'varchar', default: "'user'" },
          // Authentication provider fields
          { name: 'provider', type: 'varchar', default: "'local'" },
          { name: 'providerId', type: 'varchar', isNullable: true },
          // Password reset fields
          { name: 'resetPasswordToken', type: 'varchar', isNullable: true },
          {
            name: 'resetPasswordExpires',
            type: 'timestamp',
            isNullable: true,
          },
          // PDPA Compliance fields
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
          {
            name: 'deletionRequestedAt',
            type: 'timestamp',
            isNullable: true,
          },
          { name: 'anonymizedAt', type: 'timestamp', isNullable: true },
          // Timestamps
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
