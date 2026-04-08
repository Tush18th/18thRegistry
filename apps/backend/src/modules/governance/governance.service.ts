import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { ModulesService } from '../modules/modules.service';
import { ModuleEntity, ModuleStatus } from '../modules/entities/module.entity';

@Injectable()
export class GovernanceService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly modulesService: ModulesService,
  ) {}

  async recordAction(action: string, userId: string, moduleId: string | null, details: Record<string, unknown>) {
    const log = this.auditLogRepository.create({ 
      action, 
      actorId: userId, 
      targetId: moduleId, 
      targetResource: 'MODULE',
      details 
    });
    return this.auditLogRepository.save(log);
  }

  async updateModuleStatus(moduleId: string, status: ModuleStatus, reviewNote?: string) {
    const module = await this.modulesService.findOne(moduleId);
    
    const oldStatus = module.status;
    module.status = status;
    await this.modulesService.save(module);

    await this.recordAction(`STATUS_CHANGE_${status.toUpperCase()}`, 'system', moduleId, {
      oldStatus,
      newStatus: status,
      reviewNote
    });

    return module;
  }

  findPending(): Promise<ModuleEntity[]> {
    return this.modulesService.findMany({ where: { status: ModuleStatus.PENDING } });
  }

  async findAll(): Promise<AuditLog[]> {
    return this.auditLogRepository.find({ order: { createdAt: 'DESC' } });
  }
}
