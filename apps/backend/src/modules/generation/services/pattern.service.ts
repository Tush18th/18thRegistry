import { Injectable, Logger } from '@nestjs/common';
import { GitService } from '../../ingestion/services/git.service';
import { ModuleEntity } from '../../modules/entities/module.entity';
import * as fs from 'fs-extra';
import * as path from 'path';

export interface ModulePattern {
  name: string;
  vendor: string;
  files: { path: string; content: string }[];
}

@Injectable()
export class PatternService {
  private readonly logger = new Logger(PatternService.name);

  constructor(private readonly gitService: GitService) {}

  async extractPatterns(modules: ModuleEntity[]): Promise<ModulePattern[]> {
    const patterns: ModulePattern[] = [];

    for (const mod of modules) {
      if (!mod.repoUrl) {
        this.logger.warn(`Module ${mod.vendor}_${mod.name} has no repoUrl, skipping pattern extraction.`);
        continue;
      }

      let cloneDir = '';
      try {
        this.logger.log(`Extracting patterns from ${mod.vendor}_${mod.name}...`);
        cloneDir = await this.gitService.cloneShallow(mod.repoUrl, mod.defaultBranch || 'master');

        const moduleFiles = await this.fetchKeyFiles(cloneDir, mod.repoPath);
        patterns.push({
          name: mod.name,
          vendor: mod.vendor,
          files: moduleFiles,
        });

      } catch (error) {
        this.logger.error(`Failed to extract patterns from ${mod.vendor}_${mod.name}:`, error);
      } finally {
        if (cloneDir) await this.gitService.cleanup(cloneDir);
      }
    }

    return patterns;
  }

  private async fetchKeyFiles(basePath: string, repoPath?: string): Promise<{ path: string; content: string }[]> {
    const files: { path: string; content: string }[] = [];
    const searchPath = repoPath ? path.join(basePath, repoPath) : basePath;

    // Standard Magento 2 files of interest for architectural grounding
    const targets = [
      'etc/module.xml',
      'etc/di.xml',
      'etc/adminhtml/routes.xml',
      'etc/frontend/routes.xml',
      'composer.json',
      'registration.php'
    ];

    for (const target of targets) {
      const fullPath = path.join(searchPath, target);
      if (await fs.pathExists(fullPath)) {
        const content = await fs.readFile(fullPath, 'utf-8');
        files.push({ path: target, content });
      }
    }

    return files;
  }
}
