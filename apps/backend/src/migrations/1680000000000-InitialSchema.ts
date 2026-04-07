import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1680000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.query(`CREATE TABLE "user" (
      "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      "name" character varying NOT NULL,
      "email" character varying NOT NULL UNIQUE,
      "password" character varying NOT NULL,
      "roles" text NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
    )`);

    await queryRunner.query(`CREATE TABLE "module" (
      "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      "name" character varying NOT NULL,
      "vendor" character varying NOT NULL,
      "namespace" character varying NOT NULL,
      "description" text NOT NULL,
      "category" character varying NOT NULL,
      "status" character varying NOT NULL DEFAULT 'draft',
      "magentoVersionMin" character varying NOT NULL,
      "magentoVersionMax" character varying NOT NULL,
      "phpVersionMin" character varying NOT NULL,
      "ownerUserId" uuid NOT NULL,
      "repoUrl" character varying,
      "repoPath" character varying,
      "defaultBranch" character varying,
      "latestVersionId" character varying,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
    )`);

    await queryRunner.query(`CREATE TABLE "generation_request" (
      "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      "userId" uuid NOT NULL,
      "baseModuleIds" jsonb NOT NULL DEFAULT '[]',
      "promptText" text NOT NULL,
      "generatedCodeUrl" character varying,
      "validationStatus" character varying NOT NULL DEFAULT 'pending',
      "exportStatus" character varying NOT NULL DEFAULT 'pending',
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
    )`);

    await queryRunner.query(`CREATE TABLE "audit_log" (
      "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      "action" character varying NOT NULL,
      "userId" uuid NOT NULL,
      "moduleId" uuid,
      "details" jsonb NOT NULL DEFAULT '{}',
      "timestamp" TIMESTAMP NOT NULL DEFAULT now()
    )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "audit_log"');
    await queryRunner.query('DROP TABLE "generation_request"');
    await queryRunner.query('DROP TABLE "module"');
    await queryRunner.query('DROP TABLE "user"');
  }
}
