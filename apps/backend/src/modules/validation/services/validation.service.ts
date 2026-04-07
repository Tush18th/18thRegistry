import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import glob from 'fast-glob';

export enum ValidationSeverity {
  BLOCKING_ERROR = 'BLOCKING_ERROR',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
}

export interface ValidationResult {
  ruleId: string;
  severity: ValidationSeverity;
  message: string;
  file?: string;
  context?: string;
  suggestion?: string;
}

export interface ValidationSummary {
  status: 'passed' | 'failed';
  results: ValidationResult[];
  counts: {
    blocking: number;
    errors: number;
    warnings: number;
  };
}

@Injectable()
export class ValidationService {
  private readonly logger = new Logger(ValidationService.name);

  async validateModule(dir: string, expectedNamespace: string): Promise<ValidationSummary> {
    const results: ValidationResult[] = [];
    
    // 1. Structural Checks
    await this.checkStructuralRules(dir, results);
    
    // 2. Configuration Checks
    await this.checkConfigRules(dir, expectedNamespace, results);
    
    // 3. Namespace Checks
    await this.checkNamespaceRules(dir, expectedNamespace, results);

    const counts = {
      blocking: results.filter(r => r.severity === ValidationSeverity.BLOCKING_ERROR).length,
      errors: results.filter(r => r.severity === ValidationSeverity.ERROR).length,
      warnings: results.filter(r => r.severity === ValidationSeverity.WARNING).length,
    };

    return {
      status: counts.blocking > 0 || counts.errors > 0 ? 'failed' : 'passed',
      results,
      counts,
    };
  }

  private async checkStructuralRules(dir: string, results: ValidationResult[]) {
    const requiredFiles = [
      { path: 'registration.php', id: 'V001' },
      { path: 'etc/module.xml', id: 'V001' },
      { path: 'composer.json', id: 'V001' },
    ];

    for (const file of requiredFiles) {
      if (!await fs.pathExists(path.join(dir, file.path))) {
        results.push({
          ruleId: file.id,
          severity: ValidationSeverity.BLOCKING_ERROR,
          message: `Critical file missing: ${file.path}`,
          suggestion: `Ensure the generation or adaptation process created a standard Magento 2 module structure.`,
        });
      }
    }

    if (!await fs.pathExists(path.join(dir, 'README.md'))) {
      results.push({
        ruleId: 'V301',
        severity: ValidationSeverity.WARNING,
        message: 'README.md is missing or empty.',
        suggestion: 'Add a module description and usage instructions for internal reuse.',
      });
    }
  }

  private async checkConfigRules(dir: string, expectedNamespace: string, results: ValidationResult[]) {
    // V101: Registration Mismatch
    const regPath = path.join(dir, 'registration.php');
    if (await fs.pathExists(regPath)) {
      const content = await fs.readFile(regPath, 'utf8');
      const expectedUnderscore = expectedNamespace.replace(/\\/g, '_');
      if (!content.includes(expectedUnderscore)) {
        results.push({
          ruleId: 'V101',
          severity: ValidationSeverity.BLOCKING_ERROR,
          message: `Module name mismatch in registration.php.`,
          file: 'registration.php',
          context: content.substring(0, 200),
          suggestion: `Expected '${expectedUnderscore}' in the registration call.`,
        });
      }
    }

    // V102: Composer Name
    const compPath = path.join(dir, 'composer.json');
    if (await fs.pathExists(compPath)) {
      const composer = await fs.readJson(compPath);
      const expectedName = expectedNamespace.toLowerCase().replace(/\\/g, '/module-');
      // Simple format check (vendor/module-name)
      if (!composer.name || !composer.name.includes('/')) {
        results.push({
          ruleId: 'V102',
          severity: ValidationSeverity.ERROR,
          message: 'Invalid composer.json name format.',
          file: 'composer.json',
          suggestion: `Follow the 'vendor/module-name' convention.`,
        });
      }
    }
  }

  private async checkNamespaceRules(dir: string, expectedNamespace: string, results: ValidationResult[]) {
    const phpFiles = await glob('**/*.php', { cwd: dir, ignore: ['registration.php'] });
    
    for (const file of phpFiles) {
      const content = await fs.readFile(path.join(dir, file), 'utf8');
      const namespaceLine = content.match(/namespace\s+([^;]+);/);
      
      if (!namespaceLine) {
        results.push({
          ruleId: 'V203',
          severity: ValidationSeverity.ERROR,
          message: `Missing namespace declaration in PHP file.`,
          file,
        });
        continue;
      }

      const actualNamespace = namespaceLine[1].trim();
      if (!actualNamespace.startsWith(expectedNamespace)) {
        results.push({
          ruleId: 'V203',
          severity: ValidationSeverity.BLOCKING_ERROR,
          message: `Namespace mismatch: Expected to start with '${expectedNamespace}'.`,
          file,
          context: namespaceLine[0],
          suggestion: `Ensure the namespace correctly reflects the module's identity.`,
        });
      }
    }
  }
}
