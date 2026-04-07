import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

interface SyncDto {
  repoUrl: string;
  gitRef?: string;
}

@Controller('ingestion')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IngestionController {
  constructor(
    @InjectQueue('repo-sync') private syncQueue: Queue,
  ) {}

  @Post('sync')
  @Roles(UserRole.MAINTAINER, UserRole.ADMIN)
  @HttpCode(HttpStatus.ACCEPTED)
  async triggerSync(@Body() dto: SyncDto) {
    const job = await this.syncQueue.add('sync-repo', {
      repoUrl: dto.repoUrl,
      gitRef: dto.gitRef || 'main',
    });

    return {
      message: 'Ingestion job enqueued successfully.',
      jobId: job.id,
      repoUrl: dto.repoUrl,
    };
  }
}
