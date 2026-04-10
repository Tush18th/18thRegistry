import { AppDataSource } from './src/data-source';

async function run() {
  try {
    await AppDataSource.initialize();
    const res = await AppDataSource.query("SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')");
    console.log(JSON.stringify(res, null, 2));
    await AppDataSource.destroy();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
