import { AppDataSource } from './src/data-source';
import * as bcrypt from 'bcryptjs';

async function run() {
  try {
    await AppDataSource.initialize();
    
    const email = 'admin@18thdigitech.com';
    const password = 'Demo@1234!';
    const passwordHash = await bcrypt.hash(password, 10);
    
    await AppDataSource.query(
      'UPDATE "user" SET "role" = $1, "status" = $2, "passwordHash" = $3 WHERE email = $4',
      ['super_admin', 'active', passwordHash, email]
    );
    
    console.log(`Finalized ${email} as super_admin.`);
    await AppDataSource.destroy();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
