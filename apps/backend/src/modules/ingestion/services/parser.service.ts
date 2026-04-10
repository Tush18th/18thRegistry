import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import fastGlob from 'fast-glob';
import * as xml2js from 'xml2js';

export interface ParsedModule {
  namespace: string;
  name: string;
  vendor: string;
  packageName: string | null;
  version: string | null;
  description: string | null;
  dependencies: any[];
  fileStructure: any;
  capabilities: string[];
}

@Injectable()
export class ParserService {
  private readonly logger = new Logger(ParserService.name);
  private xmlParser = new xml2js.Parser();

  async findAndParseModules(baseDir: string): Promise<ParsedModule[]> {
    this.logger.log(`Scanning base directory: ${baseDir} for Magento 2 modules...`);

    // Using Windows-safe paths for explicitly ignoring massive directories
    const registrationFiles = await fastGlob(['**/registration.php'], {
      cwd: baseDir,
      ignore: ['**/node_modules/**', '**/vendor/**', '**/.git/**'],
    });

    this.logger.log(`Found ${registrationFiles.length} registration.php files.`);

    const parsedModules: ParsedModule[] = [];

    for (const regFile of registrationFiles) {
      const modDir = path.join(baseDir, path.dirname(regFile));
      this.logger.log(`Checking directory: ${modDir}`);
      
      try {
        const moduleXmlPath = path.join(modDir, 'etc', 'module.xml');
        // Ensure module.xml exists strictly
        await fs.access(moduleXmlPath);
        
        this.logger.log(`Discovered valid module structure at: ${modDir}`);
        const parsedData = await this.parseModuleMetadata(modDir, moduleXmlPath);
        if (parsedData) {
          this.logger.log(`Successfully parsed module: ${parsedData.namespace}`);
          parsedModules.push(parsedData);
        }
      } catch (e) {
        this.logger.warn(`Skipped directory missing etc/module.xml: ${modDir}`);
        continue;
      }
    }

    return parsedModules;
  }

  private async parseModuleMetadata(modDir: string, moduleXmlPath: string): Promise<ParsedModule | null> {
    try {
      const xmlRaw = await fs.readFile(moduleXmlPath, 'utf8');
      const xmlParsed = await this.xmlParser.parseStringPromise(xmlRaw);

      const moduleTag = xmlParsed?.config?.module?.[0];
      if (!moduleTag || !moduleTag.$ || !moduleTag.$.name) {
        return null;
      }

      const fullNamespace = moduleTag.$.name as string;
      const [vendor, name] = fullNamespace.split('_');

      let packageName = null;
      let version = moduleTag.$.setup_version || null;
      let description = null;
      let dependencies = [];

      const sequence = moduleTag.sequence?.[0]?.module;
      if (sequence && Array.isArray(sequence)) {
        dependencies.push(...sequence.map((seq: any) => seq.$.name));
      }

      // Read composer.json
      try {
        const composerRaw = await fs.readFile(path.join(modDir, 'composer.json'), 'utf8');
        const composerJson = JSON.parse(composerRaw);
        packageName = composerJson.name || packageName;
        version = composerJson.version || version;
        description = composerJson.description || null;
        if (composerJson.require) {
          dependencies.push(...Object.keys(composerJson.require));
        }
      } catch (e) {}

      // Read README.md for the "Description" field
      try {
        const readmePath = path.join(modDir, 'README.md');
        const readmeContent = await fs.readFile(readmePath, 'utf8');
        description = readmeContent || description;
      } catch (e) {}

      const fileStructure = await this.buildFileSystemTree(modDir);
      const capabilities = this.inferCapabilities(fileStructure);

      return {
        namespace: fullNamespace,
        vendor,
        name,
        packageName,
        version,
        description,
        dependencies: [...new Set(dependencies)],
        fileStructure,
        capabilities,
      };
    } catch (e) {
      this.logger.error(`Error parsing module at ${modDir}:`, e);
      return null;
    }
  }

  private async buildFileSystemTree(dir: string): Promise<any> {
    // A simplistic representation of the directory structure
    const folders = await fastGlob(['**/*'], { 
      cwd: dir, 
      onlyDirectories: true,
      ignore: ['**/node_modules/**', '**/vendor/**', '**/.git/**']
    });
    return folders;
  }

  private inferCapabilities(folders: string[]): string[] {
    const caps = [];
    if (folders.some(f => f.includes('Controller'))) caps.push('Frontend_Routing');
    if (folders.some(f => f.includes('adminhtml'))) caps.push('Admin_Interface');
    if (folders.some(f => f.includes('Setup')) || folders.some(f => f.includes('db_schema.xml'))) caps.push('Database_Schema');
    if (folders.some(f => f.includes('Observer')) || folders.some(f => f.includes('events.xml'))) caps.push('Events_Observers');
    if (folders.some(f => f.includes('Plugin')) || folders.some(f => f.includes('di.xml'))) caps.push('Dependency_Injection_Plugins');
    if (folders.some(f => f.includes('Api'))) caps.push('Service_Contracts_API');
    if (folders.some(f => f.includes('graphql'))) caps.push('GraphQL');
    if (folders.some(f => f.includes('view/frontend/layout'))) caps.push('Frontend_Layout');
    if (folders.some(f => f.includes('Preference'))) caps.push('Class_Preferences');
    return caps;
  }
}
