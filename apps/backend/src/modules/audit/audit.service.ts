import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  async logAction(
    action: string,
    targetResource: string,
    targetId: string | null,
    actorId: string | null,
    details?: any,
    ipAddress?: string,
  ): Promise<AuditLog> {
    const log = this.auditRepository.create({
      action,
      targetResource,
      targetId,
      actorId,
      details,
      ipAddress,
    });
    return this.auditRepository.save(log);
  }

  async getLogs(limit: number = 100, skip: number = 0): Promise<[AuditLog[], number]> {
    return this.auditRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip,
    });
  }
}
