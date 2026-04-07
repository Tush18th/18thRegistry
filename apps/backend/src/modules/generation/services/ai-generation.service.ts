import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromptService } from './prompt.service';
import { ClaudeService } from './claude.service';
import { PatternService } from './pattern.service';
import { ValidationService } from '../../validation/services/validation.service';
import { ModulesService } from '../../modules/modules.service';
import { ModuleEntity, ModuleStatus } from '../../modules/entities/module.entity';
import archiver from 'archiver';
import { Response } from 'express';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';

export interface AiGenerationRequest {
  vendor: string;
  moduleName: string;
  intent: string;
  referenceModuleIds: string[];
}

@Injectable()
export class AiGenerationService {
  private readonly logger = new Logger(AiGenerationService.name);

  constructor(
    private readonly promptService: PromptService,
    private readonly claudeService: ClaudeService,
    private readonly patternService: PatternService,
    private readonly modulesService: ModulesService,
    private readonly validationService: ValidationService,
    @InjectRepository(ModuleEntity)
    private readonly moduleRepository: Repository<ModuleEntity>,
  ) {}

  async generateWithAi(request: AiGenerationRequest, res: Response) {
    const { vendor, moduleName, intent, referenceModuleIds } = request;
    const tmpId = uuidv4();
    const workspaceDir = path.join(os.tmpdir(), `18th_ai_${tmpId}`);
    await fs.ensureDir(workspaceDir);

    // Create Draft Entry in Registry for governance
    const moduleEntry = this.moduleRepository.create({
      name: moduleName,
      vendor: vendor,
      namespace: `${vendor}\\${moduleName}`,
      description: `AI-Generated: ${intent.substring(0, 200)}...`,
      status: ModuleStatus.DRAFT,
      capabilities: [],
    });
    const savedEntry = await this.moduleRepository.save(moduleEntry);
    const moduleId = savedEntry.id;

    // 1. Fetch reference modules and extract patterns for grounding
    const referenceModules = await Promise.all(
        referenceModuleIds.map(id => this.modulesService.findOne(id))
    );
    const patterns = await this.patternService.extractPatterns(referenceModules);

    // 2. Build contextual prompt
    const systemPrompt = this.promptService.buildSystemPrompt();
    const patternContext = await this.promptService.buildPatternContext(patterns);
    const userPrompt = this.promptService.assembleFinalPrompt(intent, { vendor, moduleName }, patternContext);

    // 3. Call Claude
    const aiResponse = await this.claudeService.generateModule(systemPrompt, userPrompt);

    try {
      // 5. Write generated files to workspace
      for (const file of aiResponse.files) {
        const filePath = path.join(workspaceDir, file.path);
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, file.content);
      }

      // 6. Run Quality Gate
      const targetNamespace = `${vendor}\\${moduleName}`;
      const validation = await this.validationService.validateModule(workspaceDir, targetNamespace);
      this.logger.log(`AI Validation [${targetNamespace}]: ${validation.status} (${validation.counts.errors} errors)`);

      // 7. Transform AI Response into ZIP Stream
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      res.setHeader('X-Validation-Status', validation.status);
      res.setHeader('X-Validation-Errors', validation.counts.errors.toString());
      res.setHeader('X-Validation-Blockers', validation.counts.blocking.toString());
      res.setHeader('X-Workspace-Id', tmpId); 
      res.setHeader('X-Module-Id', moduleId); // Pass module ID to frontend

      res.attachment(`${vendor}_${moduleName}_AI.zip`);
      archive.pipe(res);

      archive.directory(workspaceDir, false);
      await archive.finalize();

      // 8. Schedule cleanup for 15 minutes instead of immediate delete
      // This allows the user to click "Push to Git" after downloading the ZIP
      setTimeout(async () => {
        this.logger.log(`Cleaning up stale AI workspace: ${workspaceDir}`);
        await fs.remove(workspaceDir).catch(() => {});
      }, 15 * 60 * 1000);

    } catch (error) {
       await fs.remove(workspaceDir).catch(() => {});
       throw error;
    }
  }
}
