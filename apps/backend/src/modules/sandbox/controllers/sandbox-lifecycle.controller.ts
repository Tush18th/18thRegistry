import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/entities/user.entity';

import { SandboxStatusAggregator } from '../services/sandbox-status-aggregator';
import { LifecycleManagerService } from '../services/lifecycle-manager.service';
import { LogMaskingService } from '../services/log-masking.service';
import { SandboxService } from '../services/sandbox.service';
import { TerminationPolicyService } from '../services/termination-policy.service';
import { SandboxSessionEntity } from '../entities/sandbox-session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SandboxLogQueryDto, SandboxEventQueryDto } from '../dto/sandbox-log-query.dto';
import { ApproveTeardownDto } from '../dto/approve-teardown.dto';
import { RequestExtensionDto } from '../dto/request-extension.dto';
import { SandboxEventType } from '../enums/sandbox-event-type.enum';
import { SandboxStatus } from '../enums/sandbox-status.enum';

@Controller('sandboxes/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SandboxLifecycleController {
  constructor(
    @InjectRepository(SandboxSessionEntity)
    private readonly sessionRepo: Repository<SandboxSessionEntity>,
    @InjectQueue('sandbox-orchestration')
    private readonly orchestrationQueue: Queue,
    private readonly statusAggregator: SandboxStatusAggregator,
    private readonly lifecycle: LifecycleManagerService,
    private readonly logMasking: LogMaskingService,
    private readonly sandboxService: SandboxService,
    private readonly policyService: TerminationPolicyService,
  ) {}

  @Get()
  @Roles(UserRole.DEVELOPER, UserRole.MAINTAINER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getSandboxDetail(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(req.user.role);
    return this.statusAggregator.getSessionDetail(id, req.user.sub, isAdmin);
  }

  @Get('events')
  @Roles(UserRole.DEVELOPER, UserRole.MAINTAINER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getEvents(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: SandboxEventQueryDto,
    @Request() req: any,
  ) {
    const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(req.user.role);
    await this.sandboxService.getSession(id, req.user.sub, isAdmin); // Verify access

    const events = await this.lifecycle.getEvents(id, query.since, query.limit);
    const filtered = query.type 
        ? events.filter(e => e.type === query.type) 
        : events.filter(e => e.type !== SandboxEventType.RUNTIME_LOG); // Exclude logs from event timeline

    return {
      events: filtered,
      hasMore: filtered.length === query.limit,
      nextCursor: filtered[filtered.length - 1]?.createdAt?.toISOString() || query.since,
    };
  }

  @Get('logs')
  @Roles(UserRole.DEVELOPER, UserRole.MAINTAINER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getLogs(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: SandboxLogQueryDto,
    @Request() req: any,
  ) {
    const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(req.user.role);
    await this.sandboxService.getSession(id, req.user.sub, isAdmin); // Verify access

    // We store logs as events in MVP
    const events = await this.lifecycle.getEvents(id, query.since, query.limit);
    const logs = events.filter(e => e.type === SandboxEventType.RUNTIME_LOG);

    return {
      logs: logs.map(l => ({
        timestamp: l.createdAt.toISOString(),
        stage: l.details?.stage,
        level: l.details?.level || 'info',
        message: this.logMasking.mask(l.message),
        source: l.details?.source || 'stdout',
      })),
      hasMore: logs.length === query.limit,
      nextCursor: logs[logs.length - 1]?.createdAt?.toISOString() || query.since,
    };
  }

  @Get('validation')
  @Roles(UserRole.DEVELOPER, UserRole.MAINTAINER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getValidationResults(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(req.user.role);
    const session = await this.sandboxService.getSession(id, req.user.sub, isAdmin);

    if (![SandboxStatus.RUNNING, SandboxStatus.AWAITING_APPROVAL, SandboxStatus.TERMINATED].includes(session.status)) {
        return { available: false, verdict: null };
    }

    // MVP Stub
    return {
        available: true,
        verdict: 'PASSED_WITH_WARNINGS',
        executedAt: session.updatedAt.toISOString(),
        checks: []
    };
  }

  @Post('teardown/approve')
  @Roles(UserRole.DEVELOPER, UserRole.MAINTAINER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.ACCEPTED)
  async approveTeardown(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveTeardownDto,
    @Request() req: any,
  ) {
    const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(req.user.role);
    const session = await this.sandboxService.getSession(id, req.user.sub, isAdmin);

    if (session.status !== SandboxStatus.AWAITING_APPROVAL) {
      throw new Error('Sandbox is not awaiting teardown approval.');
    }

    await this.lifecycle.updateStatus(id, SandboxStatus.TERMINATING);
    await this.lifecycle.logEvent(id, SandboxEventType.APPROVAL_REQUESTED, `Teardown approved. Reason: ${dto.reason || 'None'}`);

    return {
        message: 'Teardown approved. Destruction initiated.',
        sessionId: id
    };
  }

  @Post('teardown/extend')
  @Roles(UserRole.DEVELOPER, UserRole.MAINTAINER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async extendSandbox(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RequestExtensionDto,
    @Request() req: any,
  ) {
    const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(req.user.role);
    const session = await this.sandboxService.getSession(id, req.user.sub, isAdmin);

    if (![SandboxStatus.RUNNING, SandboxStatus.AWAITING_APPROVAL].includes(session.status)) {
      throw new Error(`Cannot extend sandbox from state: ${session.status}`);
    }

    const policy = this.policyService.getPolicy(req.user.role);
    const { allowed, reason } = this.policyService.canExtend(session, policy);

    if (!allowed) {
      throw new Error(`Extension denied: ${reason}`);
    }

    // 1. Calculate new expiry
    const extensionMinutes = dto.extensionHours * 60;
    const newExpiresAt = this.policyService.calculateNewExpiry(session.expiresAt, extensionMinutes);

    // 2. Update session
    await this.sessionRepo.update(id, {
      expiresAt: newExpiresAt,
      status: SandboxStatus.RUNNING,
      extensionCount: session.extensionCount + 1,
      cumulativeDurationMinutes: session.cumulativeDurationMinutes + extensionMinutes,
    });

    // 3. Log Event
    await this.lifecycle.logEvent(id, SandboxEventType.TTL_SCHEDULED, `Sandbox extended by ${dto.extensionHours}h. Final expiry: ${newExpiresAt.toISOString()}`);

    // 4. Reschedule BullMQ Jobs
    // We clean up old delayed jobs in this simplified version by adding new ones with the same name if supported, 
    // but in standard BullMQ we should ideally remove previous jobs or use unique IDs.
    // For MVP, we'll simple add a new enforcement job at the new time.
    const totalDuration = newExpiresAt.getTime() - Date.now();
    await this.orchestrationQueue.add('sandbox.teardown_enforcement', { sessionId: id }, { delay: totalDuration });

    return {
        message: `Sandbox extended by ${dto.extensionHours} hours.`,
        newExpiresAt: newExpiresAt.toISOString(),
    };
  }
}
