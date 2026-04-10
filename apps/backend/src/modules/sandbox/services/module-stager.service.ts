import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ModuleEntity } from '../../modules/entities/module.entity';

@Injectable()
export class ModuleStagerService {
  private readonly logger = new Logger(ModuleStagerService.name);
  private readonly baseDir: string;

  constructor() {
    this.baseDir = path.resolve(process.cwd(), 'storage', 'sandboxes');
  }

  /**
   * Prepares the Magento app/code directory and stages the module source code.
   */
  async stageModule(sessionId: string, module: ModuleEntity): Promise<string> {
    const sessionDir = path.join(this.baseDir, sessionId);
    // Relative to the web root inside the container/host src folder
    const modulePath = path.join(sessionDir, 'src', 'app', 'code', module.vendor, module.name);

    try {
      this.logger.log(`Staging module ${module.vendor}_${module.name} for session ${sessionId}`);
      
      // 1. Create directory structure
      await fs.ensureDir(modulePath);

      // 2. Inject PHP Security Config
      await this.injectSecurityConfig(sessionDir);

      // 3. Inject Module Source
      if (module.repoPath && await fs.pathExists(module.repoPath)) {
        this.logger.debug(`Copying module from local path: ${module.repoPath}`);
        await fs.copy(module.repoPath, modulePath, {
          overwrite: true,
          filter: (src) => !src.includes('node_modules') && !src.includes('.git'),
        });
      } else {
        // Fallback: Create a stub registration if no source is found
        this.logger.warn(`No source found for module ${module.id}. Creating stub registration.`);
        await this.createStubRegistration(modulePath, module);
      }

      // 4. Secure Filesystem (Ensure www-data ownership)
      // Note: We use 33:33 for standard Magento/Nginx images
      // try { await execAsync(`chown -R 33:33 ${path.join(sessionDir, 'src')}`); } catch {}

      return modulePath;
    } catch (error) {
      this.logger.error(`Failed to stage module: ${error.message}`);
      throw error;
    }
  }

  private async injectSecurityConfig(sessionDir: string) {
    const phpIni = `
; 18th Digitech Sandbox Security Profile
disable_functions = exec,passthru,shell_exec,system,proc_open,popen,curl_multi_exec,parse_ini_file,show_source
allow_url_fopen = Off
allow_url_include = Off
expose_php = Off
display_errors = Off
log_errors = On
`;
    await fs.writeFile(path.join(sessionDir, 'php-security.ini'), phpIni);
  }

  private async createStubRegistration(dir: string, module: ModuleEntity) {
    const registration = `<?php
\\Magento\\Framework\\Component\\ComponentRegistrar::register(
    \\Magento\\Framework\\Component\\ComponentRegistrar::MODULE,
    '${module.vendor}_${module.name}',
    __DIR__
);
`;
    await fs.writeFile(path.join(dir, 'registration.php'), registration);
    
    const moduleXml = `<?xml version="1.0"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="urn:magento:framework:Module/etc/module.xsd">
    <module name="${module.vendor}_${module.name}" />
</config>
`;
    await fs.ensureDir(path.join(dir, 'etc'));
    await fs.writeFile(path.join(dir, 'etc', 'module.xml'), moduleXml);
  }
}
