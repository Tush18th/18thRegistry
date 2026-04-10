import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/module_registry',
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  synchronize: false,
});

async function resetPassword() {
  await AppDataSource.initialize();

  const email = process.env.SUPER_ADMIN_EMAIL || 'admin@18th-digitech.com';
  const newPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin@18th2024';
  const hash = await bcrypt.hash(newPassword, 10);

  const result = await AppDataSource.query(
    `UPDATE "user" SET "passwordHash" = $1 WHERE email = $2 RETURNING email, role`,
    [hash, email],
  );

  if (result[1] === 0) {
    console.error(`❌ No user found with email: ${email}`);
  } else {
    console.log(`✅ Password reset for: ${email}`);
    console.log(`   New password: ${newPassword}`);
  }

  await AppDataSource.destroy();
}

resetPassword().catch((err) => {
  console.error('❌ Reset failed:', err.message);
  process.exit(1);
});
