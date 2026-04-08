import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from '../src/modules/auth/entities/user.entity';
import { AppDataSource } from '../src/data-source';

async function seed() {
  console.log('Initializing database connection...');
  await AppDataSource.initialize();
  
  console.log('Database connected. Ensuring Super Admin exists...');
  const userRepository = AppDataSource.getRepository(User);
  
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@18th-digitech.com';
  
  let superAdmin = await userRepository.findOne({ where: { role: UserRole.SUPER_ADMIN } });
  
  if (!superAdmin) {
    console.log('No Super Admin found. Creating default Super Admin...');
    const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD || 'ChangeMe123!', 10);
    
    superAdmin = userRepository.create({
      fullName: 'System Super Admin',
      email: superAdminEmail,
      passwordHash: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    });
    
    await userRepository.save(superAdmin);
    console.log('Super Admin created successfully.');
  } else {
    console.log('Super Admin already exists. Skipping creation.');
  }
  
  console.log('Seeding completed successfully.');
  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error('Error during seeding:', error);
  process.exit(1);
});
