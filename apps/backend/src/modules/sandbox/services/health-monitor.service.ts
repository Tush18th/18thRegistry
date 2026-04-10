import { Injectable, Logger, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { SandboxSessionEntity } from '../entities/sandbox-session.entity';
import { SandboxStatus } from '../enums/sandbox-status.enum';
import { OrchestratorEngineService } from './orchestrator-engine.service';
import axios from 'axios';

const execFileAsync = promisify(execFile);

@Injectable()
export class HealthMonitorService implements OnModuleInit {
  private readonly logger = new Logger(HealthMonitorService.name);

  constructor(
    @InjectRepository(SandboxSessionEntity)
    private readonly sessionRepo: Repository<SandboxSessionEntity>,
    @Inject(forwardRef(() => OrchestratorEngineService))
    private readonly orchestrator: OrchestratorEngineService,
  ) {}

  onModuleInit() {
    // Run health check every 2 minutes
    setInterval(() => this.checkAllActiveSandboxes(), 2 * 60 * 1000);
    this.logger.log('Health Monitor Service initialized (Interval: 2m)');
  }

  async checkAllActiveSandboxes(): Promise<void> {
    const activeSessions = await this.sessionRepo.find({
      where: { status: SandboxStatus.RUNNING }
    });

    if (activeSessions.length === 0) return;

    this.logger.debug(`Verifying health for ${activeSessions.length} active sandboxes...`);

    for (const session of activeSessions) {
      // 1. HTTP Probe
      const isHealthy = await this.probeSession(session);
      
      // 2. Resource Abuse Check (Security)
      const isAbusing = await this.checkResourceAbuse(session);
      
      if (isAbusing) {
        this.logger.error(`[SECURITY] Sandbox ${session.id} terminated for resource abuse.`);
        await this.orchestrator.runTerminationPipeline(session.id);
        continue;
      }

      const newStatus = isHealthy ? 'healthy' : 'degraded';
      if (session.healthStatus !== newStatus) {
        await this.sessionRepo.update(session.id, { healthStatus: newStatus });
      }
    }
  }

  private async checkResourceAbuse(session: SandboxSessionEntity): Promise<boolean> {
    try {
      // Get stats for all containers in this session
      const { stdout } = await execFileAsync('docker', [
        'stats',
        '--no-stream',
        '--format',
        '{{.CPUPerc}},{{.MemPerc}}',
        '--filter',
        `label=18th-sandbox.session-id=${session.id}`
      ], { shell: false });
      
      const lines = stdout.trim().split('\n');

      for (const line of lines) {
         const [cpu, mem] = line.split(',').map(v => parseFloat(v.replace('%', '')));
         // Thresholds: 95% CPU or 95% Memory usage
         if (cpu > 95 || mem > 95) {
            this.logger.warn(`Sandbox ${session.id} resource spike detected: CPU ${cpu}%, MEM ${mem}%`);
            return true;
         }
      }
      return false;
    } catch (error) {
      this.logger.error(`Resource check failed for ${session.id}: ${error.message}`);
      return false;
    }
  }

  private async probeSession(session: SandboxSessionEntity): Promise<boolean> {
    const url = session.endpoints?.storefront;
    if (!url) return false;

    try {
      // Basic HTTP GET heartbeat with short timeout
      const response = await axios.get(url, { timeout: 5000, validateStatus: () => true });
      return response.status >= 200 && response.status < 400;
    } catch (error) {
      this.logger.error(`Health probe failed for ${session.id} at ${url}: ${error.message}`);
      return false;
    }
  }
}
