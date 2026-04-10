import { AppDataSource } from './src/data-source';
import * as bcrypt from 'bcryptjs';

async function run() {
  try {
    await AppDataSource.initialize();
    
    // The existing user with hyphen
    const oldEmail = 'admin@18th-digitech.com';
    // The target user without hyphen (as typed in the screenshot)
    const newEmail = 'admin@18thdigitech.com';
    const password = 'Demo@1234!';
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Check if the old user exists
    const user = await AppDataSource.query('SELECT id FROM "user" WHERE email = $1', [oldEmail]);
    
    if (user.length > 0) {
      await AppDataSource.query(
        'UPDATE "user" SET email = $1, "passwordHash" = $2 WHERE email = $3',
        [newEmail, passwordHash, oldEmail]
      );
      console.log(`Updated ${oldEmail} to ${newEmail} with new password.`);
    } else {
      // Maybe it already exists?
      const exists = await AppDataSource.query('SELECT id FROM "user" WHERE email = $1', [newEmail]);
      if (exists.length > 0) {
         await AppDataSource.query(
          'UPDATE "user" SET "passwordHash" = $1 WHERE email = $2',
          [passwordHash, newEmail]
        );
        console.log(`Updated password for existing ${newEmail}.`);
      } else {
        console.log('No admin user found to update.');
      }
    }
    
    await AppDataSource.destroy();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
