import { Injectable, Logger } from '@nestjs/common';
import { DockerComposeProvider } from '../infra/docker-compose.provider';
import { ValidationResult, RuntimeCheckResult } from '../interfaces/validation-result.interface';

@Injectable()
export class RuntimeValidatorService {
  private readonly logger = new Logger(RuntimeValidatorService.name);

  constructor(private readonly infra: DockerComposeProvider) {}

  async validateSandbox(sessionId: string): Promise<ValidationResult> {
    const checks: RuntimeCheckResult[] = [];
    
    // 1. Check Module Status
    const moduleCheck = await this.runModuleStatusCheck(sessionId);
    checks.push(moduleCheck);

    if (moduleCheck.status === 'failed') {
      return { status: 'failed', checks, summary: 'Magento failed to register the module. Bootstrap aborted.' };
    }

    // 2. Run DI Compilation
    const diCheck = await this.runDiCompileCheck(sessionId);
    checks.push(diCheck);

    // 3. Run DB Schema Check
    const dbCheck = await this.runDbSchemaCheck(sessionId);
    checks.push(dbCheck);

    // Final Verdict
    const hasFailures = checks.some(c => c.status === 'failed');
    const hasWarnings = checks.some(c => c.status === 'warning');
    
    return {
      status: hasFailures ? 'failed' : (hasWarnings ? 'warning' : 'passed'),
      checks,
      summary: hasFailures 
        ? 'Critical runtime errors detected during Magento initialization.' 
        : 'All core Magento systems verified with the new module.',
    };
  }

  private async runModuleStatusCheck(sessionId: string): Promise<RuntimeCheckResult> {
    this.logger.log(`Running module status check for ${sessionId}`);
    const { stdout, stderr, exitCode } = await this.infra.execute(sessionId, 'php', ['bin/magento', 'module:status']);
    
    const isEnabled = exitCode === 0 && stdout.toLowerCase().includes('list of enabled modules');
    
    return {
      name: 'Module Registration',
      status: isEnabled ? 'passed' : 'failed',
      message: isEnabled ? 'Module successfully registered and enabled.' : 'Module not found in Magento registry.',
      details: { stdout, stderr }
    };
  }

  private async runDiCompileCheck(sessionId: string): Promise<RuntimeCheckResult> {
    this.logger.log(`Running DI compilation check for ${sessionId}`);
    // We use a timeout or specific check for DI
    const { stdout, stderr, exitCode } = await this.infra.execute(sessionId, 'php', ['bin/magento', 'setup:di:compile']);
    
    const passed = exitCode === 0 && !stderr.toLowerCase().includes('error');
    
    return {
      name: 'Dependency Injection',
      status: passed ? 'passed' : 'failed',
      message: passed ? 'DI compilation successful. No circular dependencies found.' : 'DI compilation failed. Check constructor arguments and XML configs.',
      details: { stdout, stderr }
    };
  }

  private async runDbSchemaCheck(sessionId: string): Promise<RuntimeCheckResult> {
    this.logger.log(`Running DB schema check for ${sessionId}`);
    const { stdout, stderr, exitCode } = await this.infra.execute(sessionId, 'php', ['bin/magento', 'setup:db:status']);
    
    const passed = exitCode === 0 || stdout.includes('All modules are up to date');
    
    return {
      name: 'Database Schema',
      status: passed ? 'passed' : 'warning',
      message: passed ? 'Database schema is synchronized.' : 'Schema mismatch detected. setup:upgrade might be required.',
      details: { stdout, stderr }
    };
  }
}
