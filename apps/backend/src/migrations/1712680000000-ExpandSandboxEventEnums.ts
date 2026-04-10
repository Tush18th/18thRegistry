import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExpandSandboxEventEnums1712680000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Stage events
    await queryRunner.query(`ALTER TYPE "sandbox_event_type_enum" ADD VALUE IF NOT EXISTS 'stage_queued'`);
    await queryRunner.query(`ALTER TYPE "sandbox_event_type_enum" ADD VALUE IF NOT EXISTS 'stage_started'`);
    await queryRunner.query(`ALTER TYPE "sandbox_event_type_enum" ADD VALUE IF NOT EXISTS 'stage_progress'`);
    await queryRunner.query(`ALTER TYPE "sandbox_event_type_enum" ADD VALUE IF NOT EXISTS 'stage_succeeded'`);
    await queryRunner.query(`ALTER TYPE "sandbox_event_type_enum" ADD VALUE IF NOT EXISTS 'stage_failed'`);
    await queryRunner.query(`ALTER TYPE "sandbox_event_type_enum" ADD VALUE IF NOT EXISTS 'stage_retry_scheduled'`);
    
    // Operational logs
    await queryRunner.query(`ALTER TYPE "sandbox_event_type_enum" ADD VALUE IF NOT EXISTS 'runtime_log'`);
    
    // Lifecycle management events
    await queryRunner.query(`ALTER TYPE "sandbox_event_type_enum" ADD VALUE IF NOT EXISTS 'ttl_scheduled'`);
    await queryRunner.query(`ALTER TYPE "sandbox_event_type_enum" ADD VALUE IF NOT EXISTS 'ttl_warning'`);
    await queryRunner.query(`ALTER TYPE "sandbox_event_type_enum" ADD VALUE IF NOT EXISTS 'approval_requested'`);
    await queryRunner.query(`ALTER TYPE "sandbox_event_type_enum" ADD VALUE IF NOT EXISTS 'approval_timeout'`);
    await queryRunner.query(`ALTER TYPE "sandbox_event_type_enum" ADD VALUE IF NOT EXISTS 'destruction_started'`);
    await queryRunner.query(`ALTER TYPE "sandbox_event_type_enum" ADD VALUE IF NOT EXISTS 'destruction_completed'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Postgres doesn't support easy removal of enum values
  }
}
