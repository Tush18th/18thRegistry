import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from '../auth/entities/user.entity';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/entities/audit-log.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly auditService: AuditService,
  ) {}

  async findAll(role?: UserRole, status?: UserStatus, search?: string) {
    const query = this.usersRepository.createQueryBuilder('user');
    
    if (role) {
      query.andWhere('user.role = :role', { role });
    }
    if (status) {
      query.andWhere('user.status = :status', { status });
    }
    if (search) {
      query.andWhere('(user.fullName ILIKE :search OR user.email ILIKE :search)', { search: `%${search}%` });
    }

    return query.getMany();
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(createDto: CreateUserDto, actorId: string) {
    const exists = await this.usersRepository.findOne({ where: { email: createDto.email } });
    if (exists) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(createDto.password, 10);
    const user = this.usersRepository.create({
      ...createDto,
      passwordHash: hashedPassword,
      createdBy: actorId,
    });

    const savedUser = await this.usersRepository.save(user);

    await this.auditService.logAction(
      AuditAction.USER_CREATED,
      'USER',
      savedUser.id,
      actorId,
      { email: savedUser.email, role: savedUser.role },
    );

    const { passwordHash, ...result } = savedUser;
    return result;
  }

  async update(id: string, updateDto: UpdateUserDto, actorId: string) {
    const user = await this.findOne(id);

    const updatedUser = { ...user, ...updateDto };

    // Record changes for audit
    const changes: any = {};
    for (const key of Object.keys(updateDto)) {
      if (user[key as keyof User] !== updatedUser[key as keyof User]) {
        changes[key] = {
          old: user[key as keyof User],
          new: updatedUser[key as keyof User],
        };
      }
    }

    const savedUser = await this.usersRepository.save(updatedUser);

    if (Object.keys(changes).length > 0) {
      const action = updateDto.status && updateDto.status !== user.status 
        ? AuditAction.USER_STATUS_UPDATED 
        : updateDto.role && updateDto.role !== user.role 
          ? AuditAction.USER_ROLE_UPDATED 
          : AuditAction.USER_UPDATED;

      await this.auditService.logAction(
        action,
        'USER',
        savedUser.id,
        actorId,
        changes,
      );
    }

    const { passwordHash, ...result } = savedUser;
    return result;
  }
}
