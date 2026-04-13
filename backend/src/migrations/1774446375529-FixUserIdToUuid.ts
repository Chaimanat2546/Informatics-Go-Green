import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixUserIdToUuid1774446375529 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Fix wastes table
    // Changing from bigint to uuid
    await queryRunner.query(
      `ALTER TABLE "wastes" ALTER COLUMN "userid" TYPE uuid USING NULL`,
    );

    // 2. Fix waste_history table
    // Changing from bigint to uuid
    await queryRunner.query(
      `ALTER TABLE "waste_history" ALTER COLUMN "userid" TYPE uuid USING NULL`,
    );

    // 3. Fix waste_reactions table
    // Changing from varchar to uuid
    await queryRunner.query(
      `ALTER TABLE "waste_reactions" ALTER COLUMN "userid" TYPE uuid USING "userid"::uuid`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert back
    await queryRunner.query(
      `ALTER TABLE "waste_reactions" ALTER COLUMN "userid" TYPE varchar`,
    );
    await queryRunner.query(
      `ALTER TABLE "waste_history" ALTER COLUMN "userid" TYPE bigint USING NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "wastes" ALTER COLUMN "userid" TYPE bigint USING NULL`,
    );
  }
}
