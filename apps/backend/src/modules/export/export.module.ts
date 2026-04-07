import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { GitPushService } from './services/git-push.service';

@Module({
  controllers: [ExportController],
  providers: [GitPushService],
  exports: [GitPushService],
})
export class ExportModule {}
