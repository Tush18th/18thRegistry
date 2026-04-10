import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SandboxSessionEntity } from '../entities/sandbox-session.entity';
import { SandboxStatus } from '../enums/sandbox-status.enum';

@Injectable()
export class CleanupSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(CleanupSchedulerService.name);

  constructor(
    @InjectRepository(SandboxSessionEntity)
    private readonly sessionRepo: Repository<SandboxSessionEntity>,
    @InjectQueue('sandbox-orchestration')
    private readonly orchestrationQueue: Queue,
  ) {}

  onModuleInit() {
    // Run cleanup check every 5 minutes
    setInterval(() => this.checkExpiredSessions(), 5 * 60 * 1000);
    this.logger.log('Sandbox Cleanup Scheduler initialized (Interval: 5m)');
  }

  async checkExpiredSessions(): Promise<void> {
    this.logger.debug('Scanning for expired sandbox sessions...');
    
    const expiredSessions = await this.sessionRepo.find({
      where: {
        status: SandboxStatus.RUNNING, // Only cleanup active ones
        expiresAt: LessThan(new Date()),
      },
    });

    if (expiredSessions.length === 0) return;

    this.logger.log(`Found ${expiredSessions.length} expired sessions. Dispatching termination jobs.`);

    for (const session of expiredSessions) {
      await this.orchestrationQueue.add('terminate-sandbox', { 
        sessionId: session.id,
        reason: 'TTL_EXPIRED'
      });
    }
  }
}
