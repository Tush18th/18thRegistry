import { AppDataSource } from './src/data-source';

async function run() {
  await AppDataSource.initialize();

  console.log('Checking for missing columns in module table...');

  // 1. Create the enum type if it doesn't exist
  await AppDataSource.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'module_status_enum') THEN
        CREATE TYPE module_status_enum AS ENUM ('draft', 'pending', 'approved', 'deprecated', 'archived');
        RAISE NOTICE 'Created type module_status_enum';
      ELSE
        RAISE NOTICE 'Type module_status_enum already exists';
      END IF;
    END$$;
  `);
  console.log('Step 1: Enum type ensured.');

  // 2. Add status column if it doesn't exist
  await AppDataSource.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'module' AND column_name = 'status'
      ) THEN
        ALTER TABLE "module" ADD COLUMN "status" module_status_enum NOT NULL DEFAULT 'draft';
        RAISE NOTICE 'Added column status to module table';
      ELSE
        RAISE NOTICE 'Column status already exists in module table';
      END IF;
    END$$;
  `);
  console.log('Step 2: Status column ensured.');

  // 3. Verify final schema
  const cols = await AppDataSource.query(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'module' ORDER BY ordinal_position`
  );
  console.log('Final module table columns:', cols.map((c: any) => c.column_name).join(', '));

  await AppDataSource.destroy();
  console.log('Schema migration complete!');
}

run().catch(console.error);
