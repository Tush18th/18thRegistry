import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExpandSandboxEnums1712670000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add missing status values to enum
    // Note: 'awaiting_confirmation', 'analyzing' etc are used in other flows
    await queryRunner.query(`ALTER TYPE "sandbox_status_enum" ADD VALUE IF NOT EXISTS 'analyzing'`);
    await queryRunner.query(`ALTER TYPE "sandbox_status_enum" ADD VALUE IF NOT EXISTS 'awaiting_confirmation'`);
    await queryRunner.query(`ALTER TYPE "sandbox_status_enum" ADD VALUE IF NOT EXISTS 'bootstrapping'`);
    await queryRunner.query(`ALTER TYPE "sandbox_status_enum" ADD VALUE IF NOT EXISTS 'installing'`);
    await queryRunner.query(`ALTER TYPE "sandbox_status_enum" ADD VALUE IF NOT EXISTS 'validating'`);
    await queryRunner.query(`ALTER TYPE "sandbox_status_enum" ADD VALUE IF NOT EXISTS 'awaiting_approval'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Postgres doesn't support easy removal of enum values
  }
}
