import { Controller, Post, Body, Logger, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { GitPushService, ExportConfig } from './services/git-push.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import * as path from 'path';
import * as os from 'os';

interface ExportRequest extends ExportConfig {
  workspaceId: string;
  type: 'ai' | 'clone';
}

@Controller('export')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExportController {
  private readonly logger = new Logger(ExportController.name);

  constructor(private readonly gitPushService: GitPushService) {}

  @Post('git')
  async exportToGit(@Body() request: ExportRequest) {
    const { workspaceId, type } = request;
    const prefix = type === 'ai' ? '18th_ai_' : '18th_clone_';
    const sourceDir = path.join(os.tmpdir(), `${prefix}${workspaceId}`);

    this.logger.log(`Exporting workspace ${workspaceId} to repo: ${request.repoUrl}`);
    
    try {
      const result = await this.gitPushService.pushToRepository(sourceDir, request);
      return {
        message: 'Module successfully pushed to repository',
        ...result
      };
    } catch (error) {
      this.logger.error(`Export failed: ${error.message}`);
      throw new HttpException(
        { status: 'error', message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
