import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { parseStringPromise } from 'xml2js';

export interface ValidationRule {
  id: string;
  severity: 'BLOCKING' | 'ERROR' | 'WARNING';
  message: string;
}

export interface ValidationSummary {
  status: 'passed' | 'failed';
  errors: ValidationRule[];
  metadata: {
    vendor: string;
    module: string;
    namespace: string;
    version: string;
  };
}

@Injectable()
export class StructuralValidator {
  private readonly logger = new Logger(StructuralValidator.name);

  async validate(modulePath: string, expectedNamespace?: string): Promise<ValidationSummary> {
    const errors: ValidationRule[] = [];
    const metadata = { vendor: '', module: '', namespace: '', version: '' };

    // 1. Mandatory File Checks
    const mandatoryFiles = ['registration.php', 'etc/module.xml', 'composer.json'];
    for (const file of mandatoryFiles) {
      if (!(await fs.pathExists(path.join(modulePath, file)))) {
        errors.push({
          id: 'FILE_MISSING',
          severity: 'BLOCKING',
          message: `Missing mandatory Magento 2 file: ${file}`,
        });
      }
    }

    if (errors.some(e => e.severity === 'BLOCKING')) {
      return { status: 'failed', errors, metadata };
    }

    // 2. Parse composer.json for metadata
    try {
      const composer = await fs.readJson(path.join(modulePath, 'composer.json'));
      metadata.version = composer.version || '1.0.0';
      
      const psr4 = composer.autoload?.['psr-4'];
      const firstPsr4 = psr4 ? Object.keys(psr4)[0]?.replace('\\', '') : '';
      metadata.namespace = firstPsr4 || '';

      if (expectedNamespace && firstPsr4 && firstPsr4 !== expectedNamespace.replace('\\', '')) {
         errors.push({
            id: 'NAMESPACE_MISMATCH',
            severity: 'ERROR',
            message: `PSR-4 namespace '${firstPsr4}' does not match expected '${expectedNamespace}'`,
         });
      }
    } catch (e) {
       errors.push({ id: 'JSON_ERROR', severity: 'BLOCKING', message: 'Failed to parse composer.json' });
    }

    // 3. Parse module.xml
    try {
      const xml = await fs.readFile(path.join(modulePath, 'etc/module.xml'), 'utf-8');
      const result = await parseStringPromise(xml);
      const moduleName = result.config?.module?.[0]?.$?.name;
      
      if (moduleName) {
         const [vendor, mod] = moduleName.split('_');
         metadata.vendor = vendor;
         metadata.module = mod;
      } else {
         errors.push({ id: 'XML_ERROR', severity: 'ERROR', message: 'Module name not found in module.xml' });
      }
    } catch (e) {
       errors.push({ id: 'XML_PARSE_ERROR', severity: 'BLOCKING', message: 'Failed to parse etc/module.xml' });
    }

    return {
      status: errors.some(e => e.severity === 'BLOCKING' || e.severity === 'ERROR') ? 'failed' : 'passed',
      errors,
      metadata
    };
  }
}
