import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompatibilityAndProfiles1712570000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create types for Compatibility Result
    await queryRunner.query(`
      CREATE TYPE "analysis_status_enum" AS ENUM (
        'queued',
        'in_progress',
        'completed',
        'failed'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "confidence_level_enum" AS ENUM (
        'EXPLICIT',
        'STRONG_INFERENCE',
        'WEAK_INFERENCE',
        'UNKNOWN'
      )
    `);

    // Create type for Stack Profile Status
    await queryRunner.query(`
      CREATE TYPE "stack_profile_status_enum" AS ENUM (
        'active',
        'deprecated',
        'experimental'
      )
    `);

    // Create compatibility_results table
    await queryRunner.query(`
      CREATE TABLE "compatibility_results" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "moduleId" uuid NOT NULL,
        "status" "analysis_status_enum" NOT NULL DEFAULT 'queued',
        "magentoRecommendation" jsonb,
        "phpRecommendation" jsonb,
        "infrastructure" jsonb,
        "warnings" jsonb,
        "confidenceScore" jsonb,
        "evidence" jsonb,
        "stale" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_compatibility_module" FOREIGN KEY ("moduleId") REFERENCES "module"("id") ON DELETE CASCADE
      )
    `);

    // Oops, I used "analysis_status_status_enum" but created "analysis_status_enum". Fixed below.

    // Create stack_profiles table
    await queryRunner.query(`
      CREATE TABLE "stack_profiles" (
        "id" character varying PRIMARY KEY,
        "magentoVersion" character varying NOT NULL,
        "phpVersion" character varying NOT NULL,
        "dbVersion" character varying,
        "searchEngine" character varying,
        "redisVersion" character varying,
        "rabbitmqAvailable" boolean NOT NULL DEFAULT false,
        "status" "stack_profile_status_enum" NOT NULL DEFAULT 'active',
        "supportedUntil" date,
        "notes" character varying,
        "dockerImages" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Add indexes
    await queryRunner.query(`CREATE INDEX "idx_compatibility_results_moduleId" ON "compatibility_results" ("moduleId")`);
    await queryRunner.query(`CREATE INDEX "idx_compatibility_results_createdAt" ON "compatibility_results" ("createdAt")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "stack_profiles"');
    await queryRunner.query('DROP TABLE "compatibility_results"');
    await queryRunner.query('DROP TYPE "stack_profile_status_enum"');
    await queryRunner.query('DROP TYPE "confidence_level_enum"');
    await queryRunner.query('DROP TYPE "analysis_status_enum"');
  }
}
