import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { SandboxSessionEntity } from '../entities/sandbox-session.entity';
import { SandboxStatus } from '../enums/sandbox-status.enum';

const execFileAsync = promisify(execFile);

@Injectable()
export class ReaperService implements OnModuleInit {
  private readonly logger = new Logger(ReaperService.name);

  constructor(
    @InjectRepository(SandboxSessionEntity)
    private readonly sessionRepo: Repository<SandboxSessionEntity>,
  ) {}

  onModuleInit() {
    // Run orphan cleanup every 6 hours
    setInterval(() => this.reconcileResources(), 6 * 60 * 60 * 1000);
    this.logger.log('Reaper Service (Orphan Cleanup) initialized (Interval: 6h)');
  }

  /**
   * Scans Docker for 18th-sandbox resources and destroys those not found in the DB.
   */
  async reconcileResources(): Promise<void> {
    this.logger.log('Starting infrastructure reconciliation scan...');

    try {
      // 1. Get all session IDs from Docker with our label (Native array args without shell)
      const { stdout } = await execFileAsync('docker', [
        'ps', '-a',
        '--filter', 'label=18th-sandbox.session-id',
        '--format', '{{.Label "18th-sandbox.session-id"}}'
      ], { shell: false });
      
      const dockerSessions = Array.from(new Set(stdout.trim().split('\n').filter(id => id.length > 0)));

      if (dockerSessions.length === 0) {
        this.logger.log('No tagged sandbox resources found in Docker.');
        return;
      }

      // 2. Query DB for these sessions
      const existingSessions = await this.sessionRepo.find({
        where: { id: In(dockerSessions) },
        select: ['id', 'status'],
      });

      const existingIds = existingSessions.map(s => s.id);
      const orphanedIds = dockerSessions.filter(id => !existingIds.includes(id));

      if (orphanedIds.length > 0) {
        this.logger.warn(`Detected ${orphanedIds.length} orphaned sandboxes. Initiating emergency cleanup.`);
        for (const id of orphanedIds) {
          await this.emergencyTeardown(id);
        }
      }

      this.logger.log('Reconciliation scan complete.');
    } catch (error) {
      this.logger.error(`Reconciliation failed: ${error.message}`);
    }
  }

  private async emergencyTeardown(sessionId: string) {
    this.logger.warn(`[EMERGENCY] Purging orphaned sandbox ${sessionId}`);
    try {
      // 1. Get container IDs first, explicitly avoiding shell pipes
      const { stdout } = await execFileAsync('docker', [
        'ps', '-aq', '--filter', `label=18th-sandbox.session-id=${sessionId}`
      ], { shell: false });
      
      const containerIds = stdout.trim().split('\n').filter(Boolean);
      
      // 2. Remove them if they exist
      if (containerIds.length > 0) {
        await execFileAsync('docker', ['rm', '-f', ...containerIds], { shell: false });
        this.logger.log(`Purged ${containerIds.length} container(s) for ${sessionId}`);
      }
    } catch (error) {
      this.logger.error(`Failed emergency purge for ${sessionId}: ${error.message}`);
    }
  }
}
