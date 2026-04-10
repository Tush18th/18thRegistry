import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { SandboxSessionEntity } from './entities/sandbox-session.entity';
import { SandboxEventEntity } from './entities/sandbox-event.entity';
import { SandboxController } from './controllers/sandbox.controller';
import { SandboxService } from './services/sandbox.service';
import { LifecycleManagerService } from './services/lifecycle-manager.service';
import { OrchestratorEngineService } from './services/orchestrator-engine.service';
import { CleanupSchedulerService } from './services/cleanup-scheduler.service';
import { RuntimeValidatorService } from './services/runtime-validator.service';
import { HealthMonitorService } from './services/health-monitor.service';
import { TerminationPolicyService } from './services/termination-policy.service';
import { ModuleStagerService } from './services/module-stager.service';
import { ReaperService } from './services/reaper.service';
import { TroubleshooterService } from './services/troubleshooter.service';
import { LogMaskingService } from './services/log-masking.service';
import { SandboxStatusAggregator } from './services/sandbox-status-aggregator';
import { SandboxLifecycleController } from './controllers/sandbox-lifecycle.controller';
import { DockerComposeProvider } from './infra/docker-compose.provider';
import { GenerationModule } from '../generation/generation.module';
import { SandboxProcessor } from './processors/sandbox.processor';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SandboxSessionEntity, SandboxEventEntity]),
    BullModule.registerQueue({
      name: 'sandbox-orchestration',
    }),
    AuditModule,
    GenerationModule,
  ],
  controllers: [SandboxController, SandboxLifecycleController],
  providers: [
    TerminationPolicyService,
    LogMaskingService,
    SandboxStatusAggregator,
    SandboxService, 
    LifecycleManagerService, 
    OrchestratorEngineService, 
    CleanupSchedulerService,
    RuntimeValidatorService,
    HealthMonitorService,
    ModuleStagerService,
    ReaperService,
    TroubleshooterService,
    DockerComposeProvider, 
    SandboxProcessor
  ],
  exports: [
    SandboxService, 
    LifecycleManagerService, 
    OrchestratorEngineService,
    TerminationPolicyService,
    SandboxStatusAggregator,
    TypeOrmModule
  ],
})
export class SandboxModule {}
