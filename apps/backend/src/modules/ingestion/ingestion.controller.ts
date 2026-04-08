import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Post('upload-zip')
  @Roles(UserRole.MAINTAINER, UserRole.ADMIN, UserRole.DEVELOPER)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.ACCEPTED)
  async uploadZip(@UploadedFile() file: any) {
    const job = await this.syncQueue.add('process-zip', {
      fileBuffer: file.buffer,
      fileName: file.originalname,
    });

    return {
      message: 'ZIP upload received and processing initiated.',
      jobId: job.id,
      fileName: file.originalname,
    };
  }
}
