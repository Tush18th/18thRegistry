import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSandboxTables1712560000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create sandbox_status enum type
    await queryRunner.query(`
      CREATE TYPE "sandbox_status_enum" AS ENUM (
        'requested',
        'provisioning',
        'running',
        'failed',
        'terminating',
        'terminated'
      )
    `);

    // Create sandbox_event_type enum type
    await queryRunner.query(`
      CREATE TYPE "sandbox_event_type_enum" AS ENUM (
        'infra_provisioning',
        'container_boot',
        'magento_install',
        'module_injection',
        'validation_step',
        'runtime_error',
        'termination_progress'
      )
    `);

    // Create sandbox_sessions table
    await queryRunner.query(`
      CREATE TABLE "sandbox_sessions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "moduleId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "status" "sandbox_status_enum" NOT NULL DEFAULT 'requested',
        "stackProfile" jsonb NOT NULL,
        "endpoints" jsonb,
        "expiresAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_sandbox_module" FOREIGN KEY ("moduleId") REFERENCES "module"("id") ON DELETE CASCADE
      )
    `);

    // Indexes for dashboard queries and cleanup jobs
    await queryRunner.query(`CREATE INDEX "idx_sandbox_sessions_userId" ON "sandbox_sessions" ("userId")`);
    await queryRunner.query(`CREATE INDEX "idx_sandbox_sessions_status" ON "sandbox_sessions" ("status")`);
    await queryRunner.query(`CREATE INDEX "idx_sandbox_sessions_moduleId" ON "sandbox_sessions" ("moduleId")`);

    // Create sandbox_events table (high-frequency operational log)
    await queryRunner.query(`
      CREATE TABLE "sandbox_events" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "sessionId" uuid NOT NULL,
        "type" "sandbox_event_type_enum" NOT NULL,
        "message" text NOT NULL,
        "details" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_sandbox_event_session" FOREIGN KEY ("sessionId") REFERENCES "sandbox_sessions"("id") ON DELETE CASCADE
      )
    `);

    // Index for efficient timeline queries
    await queryRunner.query(`CREATE INDEX "idx_sandbox_events_sessionId" ON "sandbox_events" ("sessionId")`);
    await queryRunner.query(`CREATE INDEX "idx_sandbox_events_createdAt" ON "sandbox_events" ("createdAt")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "sandbox_events"');
    await queryRunner.query('DROP TABLE "sandbox_sessions"');
    await queryRunner.query('DROP TYPE "sandbox_event_type_enum"');
    await queryRunner.query('DROP TYPE "sandbox_status_enum"');
  }
}
