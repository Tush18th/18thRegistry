import { AppDataSource } from '../data-source';

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('Connected to database');
    await AppDataSource.runMigrations();
    console.log('Migrations ran successfully');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Migration failure:', error);
    process.exit(1);
  }
}

run();
