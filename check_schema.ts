import { AppDataSource } from './apps/backend/src/data-source';

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('Connected to database');
    const result = await AppDataSource.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user'
    `);
    console.log(JSON.stringify(result, null, 2));
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Failure:', error);
    process.exit(1);
  }
}

run();
