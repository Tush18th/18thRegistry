import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from './entities/user.entity';

@Injectable()
export class AdminSeederService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedSuperAdmin();
  }

  private async seedSuperAdmin() {
    const email = process.env.SUPER_ADMIN_EMAIL || 'admin@18th-digitech.com';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin@18th2024';
    const fullName = process.env.SUPER_ADMIN_NAME || 'System Administrator';

    const existing = await this.usersRepository.findOne({ where: { email } });

    if (existing) {
      // Ensure existing user has super_admin role
      if (existing.role !== UserRole.SUPER_ADMIN) {
        existing.role = UserRole.SUPER_ADMIN;
        existing.status = UserStatus.ACTIVE;
        await this.usersRepository.save(existing);
        this.logger.warn(`Promoted existing user "${email}" to SUPER_ADMIN`);
      } else {
        this.logger.log(`Super Admin "${email}" already exists. Skipping seed.`);
      }
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = this.usersRepository.create({
      fullName,
      email,
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      department: 'Engineering',
      jobTitle: 'System Administrator',
    });

    await this.usersRepository.save(admin);
    this.logger.log(`✓ Super Admin seeded: ${email}`);
    this.logger.log(`  Password: ${password}`);
    this.logger.log(`  ⚠ Change this password immediately in production!`);
  }
}
