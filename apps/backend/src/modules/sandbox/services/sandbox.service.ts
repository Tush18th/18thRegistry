import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SandboxSessionEntity } from '../entities/sandbox-session.entity';
import { SandboxStatus } from '../enums/sandbox-status.enum';
import { LaunchSandboxDto } from '../dto/launch-sandbox.dto';
import { AuditService } from '../../audit/audit.service';
import { LifecycleManagerService } from './lifecycle-manager.service';

@Injectable()
export class SandboxService {
  private readonly logger = new Logger(SandboxService.name);

  constructor(
    @InjectRepository(SandboxSessionEntity)
    private readonly sessionRepo: Repository<SandboxSessionEntity>,
    @InjectQueue('sandbox-orchestration')
    private readonly orchestrationQueue: Queue,
    private readonly auditService: AuditService,
    private readonly lifecycle: LifecycleManagerService,
  ) {}

  async createSession(dto: LaunchSandboxDto, userId: string): Promise<SandboxSessionEntity> {
    // 1. Create Session
    const session = this.sessionRepo.create({
      ...dto,
      userId,
      status: SandboxStatus.REQUESTED,
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // Default 4h TTL
    });
    const savedSession = await this.sessionRepo.save(session);

    // 2. Log Governance Action
    await this.auditService.logAction(
      'SANDBOX_LAUNCH_REQUESTED',
      'SANDBOX',
      savedSession.id,
      userId,
      { stackProfile: dto.stackProfile },
    );

    // 3. Dispatch to Orchestrator
    const job = await this.orchestrationQueue.add('provision-sandbox', {
      sessionId: savedSession.id,
    });

    this.logger.log(`Sandbox session ${savedSession.id} created and dispatched (Job: ${job.id})`);
    return savedSession;
  }

  async getSession(sessionId: string, userId: string, isAdmin: boolean): Promise<SandboxSessionEntity> {
    const session = await this.sessionRepo.findOne({ 
        where: { id: sessionId },
        relations: ['module'] 
    });
    
    if (!session) {
      throw new NotFoundException(`Sandbox session ${sessionId} not found`);
    }

    // Access Control: Private by default
    if (session.userId !== userId && !isAdmin) {
      throw new ForbiddenException(`You do not have access to this sandbox session.`);
    }

    return session;
  }

  async listUserSessions(userId: string): Promise<SandboxSessionEntity[]> {
    return this.sessionRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async terminateSession(sessionId: string, userId: string, isAdmin: boolean): Promise<void> {
    const session = await this.getSession(sessionId, userId, isAdmin);
    
    if (session.status === SandboxStatus.TERMINATED) {
        return;
    }

    await this.lifecycle.updateStatus(sessionId, SandboxStatus.TERMINATING);
    
    // Log Governance Action
    await this.auditService.logAction('SANDBOX_TERMINATE_REQUESTED', 'SANDBOX', sessionId, userId);

    // Dispatch Termination Job
    await this.orchestrationQueue.add('terminate-sandbox', { sessionId });
  }
}
