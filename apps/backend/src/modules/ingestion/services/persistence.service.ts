import { Injectable, Logger } from '@nestjs/common';
import { ModulesService } from '../../modules/modules.service';
import { ModuleEntity, ModuleStatus } from '../../modules/entities/module.entity';
import { ParsedModule } from './parser.service';

@Injectable()
export class PersistenceService {
  private readonly logger = new Logger(PersistenceService.name);

  constructor(
    private readonly modulesService: ModulesService,
  ) {}

  async upsertModules(modules: ParsedModule[], repoUrl: string): Promise<void> {
    for (const parsedMod of modules) {
      try {
        const existing = await this.modulesService.findOneByNamespace(parsedMod.namespace);

        // All ingested modules start as PENDING for review in the production registry
        const status = ModuleStatus.PENDING;

        const moduleData = {
          name: parsedMod.name,
          vendor: parsedMod.vendor,
          namespace: parsedMod.namespace,
          description: parsedMod.description || '',
          dependencies: parsedMod.dependencies as any,
          fileStructure: parsedMod.fileStructure,
          capabilities: parsedMod.capabilities,
          repoUrl,
          status,
          version: parsedMod.version || '1.0.0',
          category: 'Ingested',
          ownerUserId: 'system',
        };

        if (existing) {
          this.logger.log(`Updating existing module: ${parsedMod.namespace}`);
          await this.modulesService.update(existing.id, moduleData);
        } else {
          this.logger.log(`Creating new module: ${parsedMod.namespace}`);
          await this.modulesService.create(moduleData);
        }
      } catch (error) {
        this.logger.error(`Failed to upsert module ${parsedMod.namespace}:`, error);
        // We continue gracefully without failing the entire batch
      }
    }
  }
}
