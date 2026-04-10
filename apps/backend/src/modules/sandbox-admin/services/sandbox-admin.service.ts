import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SandboxSessionEntity } from '../../sandbox/entities/sandbox-session.entity';
import { SandboxStatus, ACTIVE_SANDBOX_STATUSES } from '../../sandbox/enums/sandbox-status.enum';
import { LifecycleManagerService } from '../../sandbox/services/lifecycle-manager.service';
import { SandboxEventType } from '../../sandbox/enums/sandbox-event-type.enum';
import { AdminListSandboxesQueryDto } from '../../sandbox/dto/admin-list-sandboxes-query.dto';

@Injectable()
export class SandboxAdminService {
  constructor(
    @InjectRepository(SandboxSessionEntity)
    private readonly sandboxRepo: Repository<SandboxSessionEntity>,
    private readonly lifecycle: LifecycleManagerService,
  ) {}

  async findAll(query: AdminListSandboxesQueryDto) {
    const qb = this.sandboxRepo.createQueryBuilder('session');

    if (query.userId) {
      qb.andWhere('session.userId = :userId', { userId: query.userId });
    }
    if (query.status) {
      qb.andWhere('session.status = :status', { status: query.status });
    }
    if (query.moduleId) {
      qb.andWhere('session.moduleId = :moduleId', { moduleId: query.moduleId });
    }
    if (query.stuckSince) {
        qb.andWhere('session.status IN (:...statuses)', { statuses: [SandboxStatus.PROVISIONING, SandboxStatus.BOOTSTRAPPING, SandboxStatus.INSTALLING, SandboxStatus.VALIDATING] });
        qb.andWhere('session.updatedAt < :stuckSince', { stuckSince: new Date(query.stuckSince) });
    }

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'ASC' : 'DESC';
    qb.orderBy(`session.${sortBy}`, sortOrder);

    const page = query.page || 1;
    const limit = query.limit || 20;
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async forceDestroy(sessionId: string, adminUserId: string, reason: string): Promise<void> {
    const session = await this.sandboxRepo.findOne({ where: { id: sessionId } });
    if (!session) {
      throw new NotFoundException(`Sandbox session ${sessionId} not found`);
    }

    if (session.status === SandboxStatus.TERMINATED) {
        return;
    }

    await this.lifecycle.updateStatus(sessionId, SandboxStatus.TERMINATING);
    
    // Write admin-specific event tracking reason
    await this.lifecycle.logEvent(
        sessionId,
        SandboxEventType.DESTRUCTION_STARTED,
        `Admin force-destroyed sandbox. Reason: ${reason}`
    );

    // TODO: Dispatch to cleanup queue
  }

  async retryFailed(sessionId: string, adminUserId: string): Promise<void> {
    const session = await this.sandboxRepo.findOne({ where: { id: sessionId } });
    if (!session) {
      throw new NotFoundException(`Sandbox session ${sessionId} not found`);
    }

    if (session.status !== SandboxStatus.FAILED) {
        throw new Error('Can only retry failed sessions');
    }

    await this.lifecycle.updateStatus(sessionId, SandboxStatus.REQUESTED);
    await this.lifecycle.logEvent(
        sessionId,
        SandboxEventType.STAGE_RETRY_SCHEDULED,
        `Admin triggered retry for failed sandbox.`,
        { type: 'manual_retry' }
    );

    // TODO: Dispatch to pipeline queue
  }

  async getHealthSummary() {
    const activeCount = await this.sandboxRepo.count({
        where: [
            { status: SandboxStatus.REQUESTED },
            { status: SandboxStatus.ANALYZING },
            { status: SandboxStatus.PROVISIONING },
            { status: SandboxStatus.BOOTSTRAPPING },
            { status: SandboxStatus.INSTALLING },
            { status: SandboxStatus.VALIDATING },
            { status: SandboxStatus.RUNNING },
            { status: SandboxStatus.AWAITING_APPROVAL },
        ]
    });

    const provisioningCount = await this.sandboxRepo.count({
        where: [
             { status: SandboxStatus.PROVISIONING },
             { status: SandboxStatus.BOOTSTRAPPING },
             { status: SandboxStatus.INSTALLING },
        ]
    });

    return {
        activeSandboxes: activeCount,
        provisioningNow: provisioningCount,
        queueDepth: {
            'sandbox-pipeline': 0, // Need to inject BullMQ queue for real counts
            'sandbox-lifecycle': 0,
            'sandbox-cleanup': 0
        }
    };
  }
}
