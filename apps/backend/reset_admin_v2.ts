import { AppDataSource } from './src/data-source';
import * as bcrypt from 'bcryptjs';

async function run() {
  try {
    await AppDataSource.initialize();
    
    const email = 'admin@18thdigitech.com';
    const password = 'Demo@1234!';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 1. Ensure the user exists and has the correct password/role
    const userRepo = AppDataSource.getRepository('User');
    const user = await userRepo.findOne({ where: { email } });
    
    if (user) {
      console.log(`Updating existing user: ${email}`);
      await userRepo.update(user.id, {
        passwordHash: hashedPassword,
        role: 'super_admin' as any,
        status: 'active' as any
      });
    } else {
      console.log(`Creating new super admin: ${email}`);
      const newUser = userRepo.create({
        fullName: 'Super Admin',
        email,
        passwordHash: hashedPassword,
        role: 'super_admin' as any,
        status: 'active' as any
      });
      await userRepo.save(newUser);
    }
    
    // 2. Also ensure admin@18th-digitech.com exists as a fallback
    const altEmail = 'admin@18th-digitech.com';
    const altUser = await userRepo.findOne({ where: { email: altEmail } });
    if (altUser) {
        await userRepo.update(altUser.id, {
            passwordHash: hashedPassword,
            role: 'super_admin' as any
        });
    }

    console.log('Admin credentials synchronized successfully.');
    await AppDataSource.destroy();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
