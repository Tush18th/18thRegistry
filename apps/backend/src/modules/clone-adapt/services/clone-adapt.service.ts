import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { GitService } from '../../ingestion/services/git.service';
import { ModulesService } from '../../modules/modules.service';
import { TransformationService, TransformationConfig } from './transformation.service';
import { ValidationService } from '../../validation/services/validation.service';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';
import archiver from 'archiver';
import { Response } from 'express';
import { ModuleEntity, ModuleStatus } from '../../modules/entities/module.entity';

@Injectable()
export class CloneAdaptService {
  private readonly logger = new Logger(CloneAdaptService.name);

  constructor(
    private readonly gitService: GitService,
    private readonly modulesService: ModulesService,
    private readonly transformationService: TransformationService,
    private readonly validationService: ValidationService,
  ) {}

  async cloneAndAdapt(moduleId: string, config: TransformationConfig, res: Response) {
    const module = await this.modulesService.findOne(moduleId);
    if (!module || !module.repoUrl) {
      throw new NotFoundException('Module or repository URL not found');
    }

    const tmpWorkspaceId = uuidv4();
    const workspaceDir = path.join(os.tmpdir(), `18th_clone_${tmpWorkspaceId}`);
    let cloneDir = '';

    try {
      // Create Draft Entry in Registry
      const savedEntry = await this.modulesService.create({
        name: config.targetModule,
        vendor: config.targetVendor,
        namespace: config.targetNamespace,
        description: `Adapted from existing module ID: ${moduleId}`,
        status: ModuleStatus.DRAFT,
        capabilities: [],
      });
      const newModuleId = savedEntry.id;

      // 1. Clone the repository
      cloneDir = await this.gitService.cloneShallow(module.repoUrl, module.defaultBranch || 'master');
      
      // 2. Identify the module source path
      const sourcePath = module.repoPath ? path.join(cloneDir, module.repoPath) : cloneDir;
      
      if (!await fs.pathExists(sourcePath)) {
        throw new Error(`Module path ${module.repoPath} not found in repository`);
      }

      // 3. Create a clean workspace and copy the module files
      await fs.ensureDir(workspaceDir);
      await fs.copy(sourcePath, workspaceDir);

      // 4. Run transformations
      await this.transformationService.transformModule(workspaceDir, config);

      // 5. Run Quality Gate (Validation)
      const validation = await this.validationService.validateModule(workspaceDir, config.targetNamespace);
      this.logger.log(`Validation result for adapted module: ${validation.status} (${validation.counts.errors} errors, ${validation.counts.blocking} blocking)`);

      // 6. Build ZIP and stream to response
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      // Pass validation status through headers
      res.setHeader('X-Validation-Status', validation.status);
      res.setHeader('X-Validation-Errors', validation.counts.errors.toString());
      res.setHeader('X-Validation-Blockers', validation.counts.blocking.toString());
      res.setHeader('X-Workspace-Id', tmpWorkspaceId); 
      res.setHeader('X-Module-Id', newModuleId);

      res.attachment(`${config.targetVendor}_${config.targetModule}.zip`);
      archive.pipe(res);
      
      archive.directory(workspaceDir, false);
      await archive.finalize();

      // 7. Schedule cleanup for 15 minutes
      setTimeout(async () => {
        this.logger.log(`Cleaning up stale Clone workspace: ${workspaceDir}`);
        await fs.remove(workspaceDir).catch(() => {});
      }, 15 * 60 * 1000);

    } catch (error) {
      this.logger.error(`Clone & Adapt failed for module ${moduleId}:`, error);
      await fs.remove(workspaceDir).catch(() => {});
      throw error;
    } finally {
      if (cloneDir) await this.gitService.cleanup(cloneDir);
    }
  }
}
