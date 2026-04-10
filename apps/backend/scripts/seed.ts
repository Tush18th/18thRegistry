import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from '../src/modules/auth/entities/user.entity';
import { StackProfileEntity, StackProfileStatus } from '../src/modules/compatibility/entities/stack-profile.entity';
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
  }
  
  console.log('Ensuring Stack Profiles exist...');
  const stackProfileRepository = AppDataSource.getRepository(StackProfileEntity);
  
  const defaultProfiles = [
    {
      id: 'm246-php82',
      magentoVersion: '2.4.6-p3',
      phpVersion: '8.2',
      dbVersion: 'MariaDB 10.6',
      searchEngine: 'OpenSearch 2.x',
      redisVersion: '7.x',
      rabbitmqAvailable: true,
      status: StackProfileStatus.ACTIVE,
      notes: 'Recommended production stack for Magento 2.4.6',
      dockerImages: {
        phpFpm: '18th/magento-php-fpm:8.2-2.4.6',
        nginx: '18th/magento-nginx:1.24',
        db: 'mariadb:10.6',
        elasticsearch: 'opensearchproject/opensearch:2.x',
        redis: 'redis:7.0-alpine',
      }
    },
    {
      id: 'm244-php81',
      magentoVersion: '2.4.4-p9',
      phpVersion: '8.1',
      dbVersion: 'MariaDB 10.4',
      searchEngine: 'ElasticSearch 7.x',
      redisVersion: '6.x',
      rabbitmqAvailable: true,
      status: StackProfileStatus.ACTIVE,
      notes: 'Legacy support for Magento 2.4.4',
      dockerImages: {
        phpFpm: '18th/magento-php-fpm:8.1-2.4.4',
        nginx: '18th/magento-nginx:1.24',
        db: 'mariadb:10.4',
        elasticsearch: 'elasticsearch:7.17.10',
        redis: 'redis:6.2-alpine',
      }
    }
  ];

  for (const profile of defaultProfiles) {
    const existing = await stackProfileRepository.findOne({ where: { id: profile.id } });
    if (!existing) {
      console.log(`Creating profile: ${profile.id}...`);
      await stackProfileRepository.save(stackProfileRepository.create(profile));
    } else {
      console.log(`Profile ${profile.id} already exists. Updating...`);
      Object.assign(existing, profile);
      await stackProfileRepository.save(existing);
    }
  }
  
  console.log('Seeding completed successfully.');
  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error('Error during seeding:', error);
  process.exit(1);
});
