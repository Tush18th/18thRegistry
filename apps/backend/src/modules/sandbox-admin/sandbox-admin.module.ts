import { Module } from '@nestjs/common';
import { SandboxAdminController } from './sandbox-admin.controller';
import { SandboxAdminService } from './services/sandbox-admin.service';
import { SandboxModule } from '../sandbox/sandbox.module';

@Module({
  imports: [SandboxModule],
  controllers: [SandboxAdminController],
  providers: [SandboxAdminService],
  exports: [SandboxAdminService],
})
export class SandboxAdminModule {}
