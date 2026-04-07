import { Injectable, Logger } from '@nestjs/common';
import * as replace from 'replace-in-file';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as glob from 'fast-glob';

export interface TransformationConfig {
  sourceVendor: string;
  sourceModule: string;
  targetVendor: string;
  targetModule: string;
  targetNamespace: string;
  description?: string;
  version?: string;
}

@Injectable()
export class TransformationService {
  private readonly logger = new Logger(TransformationService.name);

  async transformModule(workspaceDir: string, config: TransformationConfig) {
    const { sourceVendor, sourceModule, targetVendor, targetModule, targetNamespace } = config;
    
    // Patterns to replace
    const sourceNamespace = `${sourceVendor}\\${sourceModule}`;
    const sourceUnderscore = `${sourceVendor}_${sourceModule}`;
    const targetUnderscore = `${targetVendor}_${targetModule}`;
    
    this.logger.log(`Transforming ${sourceNamespace} -> ${targetNamespace} in ${workspaceDir}`);

    // 1. Bulk replacement in all text files
    const options = {
      files: path.join(workspaceDir, '**/*'),
      ignore: [
        '**/.git/**',
        '**/node_modules/**',
        '**/vendor/**',
        '**/*.{png,jpg,jpeg,gif,webp,ico,zip,gz,tar,pdf}'
      ],
      from: [
        new RegExp(sourceNamespace.replace(/\\/g, '\\\\'), 'g'), // PascalCase Namespace
        new RegExp(sourceUnderscore, 'g'),                      // Underscore Identifier
        new RegExp(`${sourceVendor.toLowerCase()}/${sourceModule.toLowerCase()}`, 'g') // kebab-case packagist
      ],
      to: [
        targetNamespace,
        targetUnderscore,
        `${targetVendor.toLowerCase()}/${targetModule.toLowerCase()}`
      ],
    };

    try {
      await replace.default(options);
    } catch (error) {
      this.logger.error('Error during bulk string replacement:', error);
      throw error;
    }

    // 2. Specific logic for composer.json
    await this.updateComposerJson(workspaceDir, config);

    // 3. Documentation regeneration
    if (config.description) {
      await this.updateReadme(workspaceDir, config);
    }

    return true;
  }

  private async updateComposerJson(dir: string, config: TransformationConfig) {
    const composerPath = path.join(dir, 'composer.json');
    if (await fs.pathExists(composerPath)) {
      const composer = await fs.readJson(composerPath);
      
      composer.name = `${config.targetVendor.toLowerCase()}/module-${config.targetModule.toLowerCase()}`;
      composer.description = config.description || composer.description;
      composer.version = config.version || '1.0.0';
      
      // Update PSR-4 keys
      if (composer.autoload?.['psr-4']) {
        const oldKey = `${config.sourceVendor}\\${config.sourceModule}\\`;
        const newKey = `${config.targetVendor}\\${config.targetModule}\\`;
        
        if (composer.autoload['psr-4'][oldKey]) {
          const val = composer.autoload['psr-4'][oldKey];
          delete composer.autoload['psr-4'][oldKey];
          composer.autoload['psr-4'][newKey] = val;
        }
      }

      await fs.writeJson(composerPath, composer, { spaces: 4 });
    }
  }

  private async updateReadme(dir: string, config: TransformationConfig) {
    const readmePath = path.join(dir, 'README.md');
    const content = `# ${config.targetVendor} ${config.targetModule}\n\n${config.description}\n\n## Generation Details\n- Adapted from: ${config.sourceVendor}_${config.sourceModule}\n- Date: ${new Date().toISOString()}`;
    await fs.writeFile(readmePath, content);
  }
}
