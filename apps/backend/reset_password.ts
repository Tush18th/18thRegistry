import { AppDataSource } from './src/data-source';
import * as bcrypt from 'bcryptjs';

async function run() {
  try {
    await AppDataSource.initialize();
    const email = 'admin@18thdigitech.com';
    const password = 'Demo@1234!';
    const passwordHash = await bcrypt.hash(password, 10);

    await AppDataSource.query(
      'UPDATE "user" SET "passwordHash" = $1 WHERE email = $2',
      [passwordHash, email]
    );

    console.log(`Password reset for ${email}`);
    await AppDataSource.destroy();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
