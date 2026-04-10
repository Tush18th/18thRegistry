import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceSandboxErrorLogging1712660000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sandbox_sessions" ADD COLUMN "failureReason" text`);
    await queryRunner.query(`ALTER TABLE "sandbox_sessions" ADD COLUMN "failureStage" varchar`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sandbox_sessions" DROP COLUMN "failureStage"`);
    await queryRunner.query(`ALTER TABLE "sandbox_sessions" DROP COLUMN "failureReason"`);
  }
}
