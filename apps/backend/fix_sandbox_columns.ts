import { AppDataSource } from './src/data-source';

async function run() {
  try {
    await AppDataSource.initialize();
    
    await AppDataSource.query('ALTER TABLE "sandbox_sessions" ADD COLUMN IF NOT EXISTS "validationResults" jsonb');
    await AppDataSource.query('ALTER TABLE "sandbox_sessions" ADD COLUMN IF NOT EXISTS "healthStatus" character varying DEFAULT \'unknown\'');
    await AppDataSource.query('ALTER TABLE "sandbox_sessions" ADD COLUMN IF NOT EXISTS "extensionCount" integer DEFAULT 0');
    await AppDataSource.query('ALTER TABLE "sandbox_sessions" ADD COLUMN IF NOT EXISTS "cumulativeDurationMinutes" integer DEFAULT 0');
    await AppDataSource.query('ALTER TABLE "sandbox_sessions" ADD COLUMN IF NOT EXISTS "remediationSuggestion" text');
    await AppDataSource.query('ALTER TABLE "sandbox_sessions" ADD COLUMN IF NOT EXISTS "troubleshootingContext" jsonb');
    
    console.log('Columns added successfully');
    await AppDataSource.destroy();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
