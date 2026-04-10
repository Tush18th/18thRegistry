import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { OrchestratorEngineService } from '../services/orchestrator-engine.service';

@Processor('sandbox-orchestration', {
  concurrency: 5, // Limit parallel sandboxes per worker instance
})
export class SandboxProcessor extends WorkerHost {
  private readonly logger = new Logger(SandboxProcessor.name);

  constructor(private readonly orchestrator: OrchestratorEngineService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { sessionId } = job.data;
    this.logger.log(`Processing job ${job.name} for session ${sessionId} (ID: ${job.id})`);

    switch (job.name) {
      case 'provision-sandbox':
        return this.orchestrator.runProvisioningPipeline(sessionId);
      
      case 'terminate-sandbox':
        return this.orchestrator.runTerminationPipeline(sessionId);
      
      case 'sandbox.warn':
        return this.orchestrator.handleTtlWarning(sessionId, job.data.stage);
      
      case 'sandbox.open_approval':
        return this.orchestrator.handleOpenApproval(sessionId);
      
      case 'sandbox.teardown_enforcement':
        return this.orchestrator.handleTeardownEnforcement(sessionId, job.data.reason);
      
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
        throw new Error(`Job ${job.name} is not supported by SandboxProcessor`);
    }
  }
}
