import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GovernanceController } from './governance.controller';
import { GovernanceService } from './governance.service';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { ModulesModule } from '../modules/modules.module';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog]), ModulesModule],

  controllers: [GovernanceController],
  providers: [GovernanceService],
  exports: [GovernanceService],
})
export class GovernanceModule {}
