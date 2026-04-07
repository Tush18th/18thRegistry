import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { GitService } from './services/git.service';
import { ParserService } from './services/parser.service';
import { PersistenceService } from './services/persistence.service';

@Processor('repo-sync')
export class IngestionProcessor extends WorkerHost {
  private readonly logger = new Logger(IngestionProcessor.name);

  constructor(
    private readonly gitService: GitService,
    private readonly parserService: ParserService,
    private readonly persistenceService: PersistenceService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { repoUrl, gitRef } = job.data;
    
    this.logger.log(`Received ingestion job ${job.id} for ${repoUrl} @ ${gitRef}`);

    let tmpPath: string | null = null;
    try {
      this.logger.log(`Starting production ingestion for ${repoUrl} @ ${gitRef}`);
      tmpPath = await this.gitService.cloneShallow(repoUrl, gitRef || 'main');

      // 1. Discovery & Metadata Phase
      const parsedModules = await this.parserService.findAndParseModules(tmpPath);
      
      if (parsedModules.length === 0) {
        this.logger.warn(`No Magento 2 modules discovered in ${repoUrl}`);
        return { status: 'empty', count: 0 };
      }

      // 2. Production Persistence with Metadata Mapping
      this.logger.log(`Persisting ${parsedModules.length} modules from ${repoUrl}...`);
      await this.persistenceService.upsertModules(parsedModules, repoUrl);

      return { status: 'success', count: parsedModules.length };

    } catch (error) {
      this.logger.error(`Ingestion job ${job.id} failed:`, error);
      throw error; // Will trigger BullMQ retry backoff
    } finally {
      // 4. Cleanup
      if (tmpPath) {
        await this.gitService.cleanup(tmpPath);
      }
    }
  }
}
