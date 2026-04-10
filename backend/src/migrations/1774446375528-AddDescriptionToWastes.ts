import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDescriptionToWastes1774446375528 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wastes" ADD COLUMN IF NOT EXISTS "description" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wastes" DROP COLUMN "description"`);
    }
}
