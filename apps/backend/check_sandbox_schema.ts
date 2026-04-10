import { AppDataSource } from './src/data-source';

async function run() {
  try {
    await AppDataSource.initialize();
    const res = await AppDataSource.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'sandbox_sessions'");
    console.log(JSON.stringify(res, null, 2));
    await AppDataSource.destroy();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
