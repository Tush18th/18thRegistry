import { AppDataSource } from './src/data-source';

async function run() {
  await AppDataSource.initialize();
  const cols = await AppDataSource.query(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'module' ORDER BY ordinal_position`
  );
  console.log('Module table columns:', JSON.stringify(cols, null, 2));

  // Also check if status enum exists
  const types = await AppDataSource.query(
    `SELECT typname FROM pg_type WHERE typtype = 'e' AND typname LIKE '%module%'`
  );
  console.log('Module-related enum types:', JSON.stringify(types, null, 2));

  await AppDataSource.destroy();
}

run().catch(console.error);
