import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SandboxSessionEntity } from '../entities/sandbox-session.entity';
import { SandboxEventEntity } from '../entities/sandbox-event.entity';
import { SandboxStatus } from '../enums/sandbox-status.enum';
import { SandboxEventType } from '../enums/sandbox-event-type.enum';

@Injectable()
export class LifecycleManagerService {
  private readonly logger = new Logger(LifecycleManagerService.name);

  constructor(
    @InjectRepository(SandboxSessionEntity)
    private readonly sessionRepo: Repository<SandboxSessionEntity>,
    @InjectRepository(SandboxEventEntity)
    private readonly eventRepo: Repository<SandboxEventEntity>,
  ) {}

  async updateStatus(
    sessionId: string,
    status: SandboxStatus,
    reason?: string,
    stage?: string,
  ): Promise<void> {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) {
      throw new Error(`Sandbox session ${sessionId} not found`);
    }

    // Basic Validation: Don't allow updates to terminal states
    if (session.status === SandboxStatus.TERMINATED && status !== SandboxStatus.TERMINATED) {
      this.logger.warn(`Attempted to update TERMINATED sandbox ${sessionId} to ${status}`);
      return;
    }

    const updatePack: any = { status };
    if (reason) updatePack.failureReason = reason;
    if (stage) updatePack.failureStage = stage;

    await this.sessionRepo.update(sessionId, updatePack);
    this.logger.log(
      `Sandbox ${sessionId} status updated to ${status}` +
        (stage ? ` at stage ${stage}` : '') +
        (reason ? `: ${reason}` : ''),
    );
  }

  async logEvent(
    sessionId: string,
    type: SandboxEventType,
    message: string,
    details?: any,
  ): Promise<SandboxEventEntity> {
    const event = this.eventRepo.create({
      sessionId,
      type,
      message,
      details,
    });
    return this.eventRepo.save(event);
  }

  async getEvents(sessionId: string, since?: string, limit?: number): Promise<SandboxEventEntity[]> {
    const qb = this.eventRepo.createQueryBuilder('event')
      .where('event.sessionId = :sessionId', { sessionId })
      .orderBy('event.createdAt', 'ASC');

    if (since) {
      qb.andWhere('event.createdAt >= :since', { since: new Date(since) });
    }

    if (limit) {
      qb.take(limit);
    }

    return qb.getMany();
  }
}
