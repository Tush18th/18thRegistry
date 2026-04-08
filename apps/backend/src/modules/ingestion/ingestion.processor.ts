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
    const { repoUrl, gitRef, fileBuffer, fileName } = job.data;
    const jobType = job.name;
    
    this.logger.log(`Received ${jobType} job ${job.id}`);

    let tmpPath: string | null = null;
    try {
      if (jobType === 'sync-repo') {
        this.logger.log(`Starting Git ingestion for ${repoUrl} @ ${gitRef}`);
        tmpPath = await this.gitService.cloneShallow(repoUrl, gitRef || 'main');
      } else if (jobType === 'process-zip') {
        this.logger.log(`Starting ZIP ingestion for ${fileName}`);
        const unzipper = require('unzipper');
        const fs = require('fs-extra');
        const path = require('path');
        const os = require('os');
        
        tmpPath = path.join(os.tmpdir(), `18th-zip-${Date.now()}`);
        await fs.ensureDir(tmpPath);
        
        // Convert the buffer (which might be an object {type: 'Buffer', data: [...]}) back to a Buffer
        const buffer = Buffer.from(fileBuffer.data || fileBuffer);
        const directory = await unzipper.Open.buffer(buffer);
        await directory.extract({ path: tmpPath });
      }

      if (!tmpPath) throw new Error('No temporary path created for ingestion.');

      // 1. Discovery & Metadata Phase
      const parsedModules = await this.parserService.findAndParseModules(tmpPath);
      
      if (parsedModules.length === 0) {
        this.logger.warn(`No Magento 2 modules discovered.`);
        return { status: 'empty', count: 0 };
      }

      // 2. Production Persistence
      const sourceLabel = jobType === 'sync-repo' ? repoUrl : `Uploaded ZIP: ${fileName}`;
      this.logger.log(`Persisting ${parsedModules.length} modules from ${sourceLabel}...`);
      await this.persistenceService.upsertModules(parsedModules, sourceLabel);

      return { status: 'success', count: parsedModules.length };

    } catch (error) {
      this.logger.error(`Ingestion job ${job.id} (${jobType}) failed:`, error);
      throw error;
    } finally {
      if (tmpPath) {
        const fs = require('fs-extra');
        await fs.remove(tmpPath);
      }
    }
  }
}
