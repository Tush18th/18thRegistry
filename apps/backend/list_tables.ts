import { AppDataSource } from './src/data-source';

async function run() {
  try {
    await AppDataSource.initialize();
    const res = await AppDataSource.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log(JSON.stringify(res, null, 2));
    await AppDataSource.destroy();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
