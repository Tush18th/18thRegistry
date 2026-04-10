import { AppDataSource } from './src/data-source';

async function run() {
  await AppDataSource.initialize();
  await AppDataSource.query('TRUNCATE TABLE module CASCADE');
  console.log('Module table truncated.');
  await AppDataSource.destroy();
}

run().catch(console.error);
