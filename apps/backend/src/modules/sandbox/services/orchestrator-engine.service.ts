import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DockerComposeProvider } from '../infra/docker-compose.provider';
import { LifecycleManagerService } from './lifecycle-manager.service';
import { SandboxSessionEntity } from '../entities/sandbox-session.entity';
import { SandboxStatus, ACTIVE_SANDBOX_STATUSES } from '../enums/sandbox-status.enum';
import { SandboxEventType } from '../enums/sandbox-event-type.enum';
import { RuntimeValidatorService } from './runtime-validator.service';
import { ModuleStagerService } from './module-stager.service';
import { TroubleshooterService } from './troubleshooter.service';
import { ValidationResult } from '../interfaces/validation-result.interface';

@Injectable()
export class OrchestratorEngineService {
  private readonly logger = new Logger(OrchestratorEngineService.name);

  constructor(
    @InjectRepository(SandboxSessionEntity)
    private readonly sessionRepo: Repository<SandboxSessionEntity>,
    @InjectQueue('sandbox-orchestration')
    private readonly orchestrationQueue: Queue,
    private readonly infra: DockerComposeProvider,
    private readonly lifecycle: LifecycleManagerService,
    private readonly validator: RuntimeValidatorService,
    private readonly stager: ModuleStagerService,
    private readonly troubleshooter: TroubleshooterService,
  ) {}

  async runProvisioningPipeline(sessionId: string): Promise<void> {
    let currentStage = 'INITIALIZING';
    try {
      const session = await this.sessionRepo.findOne({ 
        where: { id: sessionId },
        relations: ['module']
      });
      if (!session) throw new Error(`Session ${sessionId} not found`);

      // 1. INFRA PROVISIONING
      currentStage = 'INFRA_PROVISIONING';
      await this.lifecycle.updateStatus(sessionId, SandboxStatus.PROVISIONING, 'Starting infrastructure...', currentStage);
      await this.lifecycle.logEvent(sessionId, SandboxEventType.INFRA_PROVISIONING, 'Allocating isolated namespace resources...');
      
      const infraResult = await this.infra.provision({
        sessionId,
        magentoVersion: session.stackProfile.magentoVersion,
        phpVersion: session.stackProfile.phpVersion,
        services: session.stackProfile.services,
      });
      
      await this.sessionRepo.update(sessionId, { endpoints: infraResult.endpoints });
      await this.lifecycle.logEvent(sessionId, SandboxEventType.INFRA_PROVISIONING, 'Infrastructure staging complete. Scaling environment...');

      // 2. STAGING & BOOTSTRAPPING
      currentStage = 'BOOTSTRAPPING';
      await this.lifecycle.updateStatus(sessionId, SandboxStatus.BOOTSTRAPPING, 'Staging module and bootstrapping Magento...', currentStage);
      
      await this.stager.stageModule(sessionId, session.module);
      await this.lifecycle.logEvent(sessionId, SandboxEventType.CONTAINER_BOOT, 'Containers active. Staging area prepared.');

      // Run magento setup:install
      await this.lifecycle.logEvent(sessionId, SandboxEventType.CONTAINER_BOOT, 'Running magento setup:install...');
      const installRes = await this.infra.execute(sessionId, 'php', [
        'bin/magento', 'setup:install',
        '--db-host=db', '--db-name=magento', '--db-user=root', '--db-password=root',
        '--base-url=' + infraResult.endpoints.storefront,
        '--backend-frontname=admin',
        '--use-rewrites=1'
      ]);
      if (installRes.exitCode !== 0) {
        throw new Error(`Magento installation failed: ${installRes.stderr}`);
      }

      // 3. INSTALLING (Module Enablement & Upgrades)
      currentStage = 'INSTALLING';
      await this.lifecycle.updateStatus(sessionId, SandboxStatus.INSTALLING, 'Executing module installation...', currentStage);
      await this.lifecycle.logEvent(sessionId, SandboxEventType.MAGENTO_INSTALL, `Enabling module ${session.module.vendor}_${session.module.name}...`);
      
      const upgradeRes = await this.infra.execute(sessionId, 'php', ['bin/magento', 'setup:upgrade']);
      if (upgradeRes.exitCode !== 0) {
        throw new Error(`Module installation failed during setup:upgrade: ${upgradeRes.stderr}`);
      }
      
      await this.lifecycle.logEvent(sessionId, SandboxEventType.MAGENTO_INSTALL, 'Module installation and schema migration verified. Clearing caches...');
      await this.infra.execute(sessionId, 'php', ['bin/magento', 'cache:flush']);

      // 4. VALIDATING
      currentStage = 'VALIDATING';
      await this.lifecycle.updateStatus(sessionId, SandboxStatus.VALIDATING, 'Running runtime validation...', currentStage);
      await this.lifecycle.logEvent(sessionId, SandboxEventType.VALIDATION_STEP, 'Running automated structural validation...');
      
      const validationResults = await this.validator.validateSandbox(sessionId);
      await this.sessionRepo.update(sessionId, { validationResults });
      
      if (validationResults.status === 'failed') {
        throw new Error(`Validation failed: ${validationResults.summary}`);
      }
      
      await this.lifecycle.logEvent(sessionId, SandboxEventType.VALIDATION_STEP, 'Validation passed. No conflicts detected.');

      // 5. RUNNING
      currentStage = 'RUNNING';
      await this.lifecycle.updateStatus(sessionId, SandboxStatus.RUNNING, 'Environment live', currentStage);
      await this.lifecycle.logEvent(sessionId, SandboxEventType.CONTAINER_BOOT, 'Sandbox is live and ready for inspection.', { endpoints: infraResult.endpoints });
      
      // 6. Schedule Termination Workflow
      if (session.expiresAt) {
        const totalDuration = session.expiresAt.getTime() - Date.now();
        
        const warn1Delay = totalDuration - (15 * 60 * 1000);
        if (warn1Delay > 0) await this.orchestrationQueue.add('sandbox.warn', { sessionId, stage: 1 }, { delay: warn1Delay });

        const warn2Delay = totalDuration - (5 * 60 * 1000);
        if (warn2Delay > 0) await this.orchestrationQueue.add('sandbox.warn', { sessionId, stage: 2 }, { delay: warn2Delay });

        const approvalDelay = totalDuration - (2 * 60 * 1000);
        if (approvalDelay > 0) await this.orchestrationQueue.add('sandbox.open_approval', { sessionId }, { delay: approvalDelay });

        await this.orchestrationQueue.add('sandbox.teardown_enforcement', { sessionId }, { delay: totalDuration });

        await this.lifecycle.logEvent(sessionId, SandboxEventType.TTL_SCHEDULED, `Termination lifecycle scheduled. Expiry in ${Math.round(totalDuration / 60000)} minutes.`);
      }

      this.logger.log(`Session ${sessionId} successfully transitioned to RUNNING`);
    } catch (error) {
      this.logger.error(`Pipeline failed for session ${sessionId} at stage ${currentStage}: ${error.message}`);
      await this.lifecycle.updateStatus(sessionId, SandboxStatus.FAILED, error.message, currentStage);
      await this.lifecycle.logEvent(sessionId, SandboxEventType.RUNTIME_ERROR, `Pipeline failure [${currentStage}]: ${error.message}`);

      // AI Troubleshooting (Async)
      this.troubleshooter.analyzeFailure(sessionId, error.message).catch(err => {
        this.logger.error(`Self-triggered troubleshooting failed: ${err.message}`);
      });
    }
  }

  async runTerminationPipeline(sessionId: string): Promise<void> {
    try {
      await this.lifecycle.logEvent(sessionId, SandboxEventType.DESTRUCTION_STARTED, 'Tearing down virtual infrastructure...');
      await this.infra.teardown(sessionId);
      await this.lifecycle.updateStatus(sessionId, SandboxStatus.TERMINATED);
      await this.lifecycle.logEvent(sessionId, SandboxEventType.DESTRUCTION_STARTED, 'Cleanup complete. Resource released.');
    } catch (error) {
      this.logger.error(`Termination failed for ${sessionId}: ${error.message}`);
      // Mark as terminated anyway to stop cleanup loops
      await this.lifecycle.updateStatus(sessionId, SandboxStatus.TERMINATED, 'Terminated with errors');
    }
  }

  async handleTtlWarning(sessionId: string, stage: number): Promise<void> {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session || !ACTIVE_SANDBOX_STATUSES.includes(session.status as any)) return;

    await this.lifecycle.logEvent(
      sessionId, 
      SandboxEventType.TTL_WARNING, 
      `Warning: Sandbox will be terminated in ${stage === 1 ? '15' : '5'} minutes.`
    );
  }

  async handleOpenApproval(sessionId: string): Promise<void> {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session || !ACTIVE_SANDBOX_STATUSES.includes(session.status as any)) return;

    await this.lifecycle.updateStatus(sessionId, SandboxStatus.AWAITING_APPROVAL);
    await this.lifecycle.logEvent(
      sessionId, 
      SandboxEventType.APPROVAL_REQUESTED, 
      'Action Required: Destruction approval requested. Manual intervention required within 2 minutes.'
    );
  }

  async handleTeardownEnforcement(sessionId: string, reason?: string): Promise<void> {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session || session.status === SandboxStatus.TERMINATED) return;

    // Check if it was extended at the last second or already terminated
    if (session.status === SandboxStatus.AWAITING_APPROVAL || session.status === SandboxStatus.RUNNING) {
      this.logger.log(`Forcing teardown for session ${sessionId}. Reason: ${reason || 'TTL_EXPIRED'}`);
      
      if (session.status === SandboxStatus.AWAITING_APPROVAL) {
        await this.lifecycle.logEvent(sessionId, SandboxEventType.APPROVAL_TIMEOUT, 'Approval window expired. Forcing teardown.');
      }

      return this.runTerminationPipeline(sessionId);
    }
  }
}
