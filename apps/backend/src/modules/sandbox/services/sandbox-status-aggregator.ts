import { Injectable, NotFoundException } from '@nestjs/common';
import { SandboxService } from './sandbox.service';
import { LifecycleManagerService } from './lifecycle-manager.service';
import { SandboxStatus } from '../enums/sandbox-status.enum';
import { SandboxEventType } from '../enums/sandbox-event-type.enum';

@Injectable()
export class SandboxStatusAggregator {
  constructor(
    private readonly sandboxService: SandboxService,
    private readonly lifecycle: LifecycleManagerService,
  ) {}

  async getSessionDetail(sessionId: string, userId: string, isAdmin: boolean) {
    const session = await this.sandboxService.getSession(sessionId, userId, isAdmin);
    const events = await this.lifecycle.getEvents(sessionId);

    // 1. Find progress
    const progressEvents = events.filter(
      (e) => e.type === SandboxEventType.STAGE_PROGRESS || e.type === SandboxEventType.STAGE_STARTED
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    const latestProgress = progressEvents[0];
    
    let progress = null;
    if (latestProgress) {
        progress = {
            currentStage: latestProgress.details?.stage || 'unknown',
            percent: latestProgress.details?.percent || (latestProgress.type === SandboxEventType.STAGE_STARTED ? 0 : null),
            detail: latestProgress.message,
        };
    }

    // 2. Teardown computation
    let teardown = null;
    if (session.status === SandboxStatus.AWAITING_APPROVAL) {
      const approvalDeadline = new Date(session.expiresAt.getTime() + 15 * 60000); // +15 mins
      teardown = {
        state: 'awaiting',
        approvalDeadline: approvalDeadline.toISOString(),
      };
    }

    // 3. Validation result lookup
    // (Stubbed for MVP until ValidationResults model is wired)
    const validation = {
        available: session.status === SandboxStatus.RUNNING || session.status === SandboxStatus.AWAITING_APPROVAL || session.status === SandboxStatus.TERMINATED,
        verdict: null,
        checks: []
    };

    return {
      session: {
        id: session.id,
        moduleId: session.moduleId,
        userId: session.userId,
        status: session.status,
        stackProfile: session.stackProfile,
        endpoints: session.endpoints,
        expiresAt: session.expiresAt?.toISOString(),
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
      },
      progress,
      teardown,
      validation,
    };
  }
}
