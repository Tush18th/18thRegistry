import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ModuleEntity, ModuleStatus } from './entities/module.entity';
import { UserRole } from '../auth/entities/user.entity';

import { StructuralValidator, ValidationSummary } from '../validation/services/structural-validator.service';

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(ModuleEntity)
    private readonly moduleRepository: Repository<ModuleEntity>,
    private readonly validator: StructuralValidator,
  ) {}

  async create(dto: Partial<ModuleEntity>): Promise<ModuleEntity> {
    const module = this.moduleRepository.create(dto);
    return this.moduleRepository.save(module);
  }

  async save(entity: ModuleEntity): Promise<ModuleEntity> {
    return this.moduleRepository.save(entity);
  }

  async count(options?: any): Promise<number> {
    return this.moduleRepository.count(options);
  }

  async registerFromPath(modulePath: string, ownerUserId?: string): Promise<{ module: ModuleEntity, validation: ValidationSummary }> {
    const validation = await this.validator.validate(modulePath);
    
    if (validation.status === 'failed') {
      throw new Error(`Integrity Check Failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    const { vendor, module: name, namespace, version } = validation.metadata;

    const existing = await this.moduleRepository.findOne({ where: { namespace } });
    if (existing) {
      Object.assign(existing, { vendor, name, version });
      const saved = await this.moduleRepository.save(existing);
      return { module: saved, validation };
    }

    const module = this.moduleRepository.create({
      name,
      vendor,
      namespace,
      version,
      status: ModuleStatus.PENDING, // New arrivals start as PENDING for review
      ownerUserId,
    });

    const saved = await this.moduleRepository.save(module);
    return { module: saved, validation };
  }

  async search(query: string, vendor?: string, userRole?: UserRole) {
    const qb = this.moduleRepository.createQueryBuilder('module');

    if (query) {
      qb.andWhere(
        '(module.name ILIKE :query OR module.namespace ILIKE :query OR module.description ILIKE :query)',
        { query: `%${query}%` },
      );
    }

    if (vendor) {
      qb.andWhere('module.vendor = :vendor', { vendor });
    }

    // Role-based visibility
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.MAINTAINER) {
      qb.andWhere('module.status = :status', { status: ModuleStatus.APPROVED });
    }

    qb.orderBy('module.createdAt', 'DESC');
    return qb.getMany();
  }

  async getStats() {
    const total = await this.moduleRepository.count();
    const approved = await this.moduleRepository.count({ where: { status: ModuleStatus.APPROVED } });
    const draft = await this.moduleRepository.count({ where: { status: ModuleStatus.DRAFT } });
    const pending = await this.moduleRepository.count({ where: { status: ModuleStatus.PENDING } });

    // Extract unique vendors for filtering
    const vendorsResult = await this.moduleRepository
      .createQueryBuilder('module')
      .select('DISTINCT(module.vendor)', 'vendor')
      .getRawMany();

    return {
      total,
      approved,
      draft,
      pending,
      vendors: (vendorsResult.map(v => v.vendor) as string[]).filter(v => !!v),
    };
  }

  async findOne(id: string): Promise<ModuleEntity> {
    const module = await this.moduleRepository.findOne({ where: { id } });
    if (!module) {
      throw new NotFoundException('Module not found');
    }
    return module;
  }

  async findOneByNamespace(namespace: string): Promise<ModuleEntity | null> {
    return this.moduleRepository.findOne({ where: { namespace } });
  }

  async findMany(options?: any): Promise<ModuleEntity[]> {
    return this.moduleRepository.find(options);
  }

  async update(id: string, dto: UpdateModuleDto): Promise<ModuleEntity> {
    const module = await this.findOne(id);
    Object.assign(module, dto);
    return this.moduleRepository.save(module);
  }

  async remove(id: string): Promise<void> {
    const module = await this.findOne(id);
    await this.moduleRepository.remove(module);
  }
}
