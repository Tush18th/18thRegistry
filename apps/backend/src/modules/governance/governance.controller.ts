import { Controller, Post, Body, Get, Param, UseGuards, Logger, Patch } from '@nestjs/common';
import { GovernanceService } from './governance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { ModuleStatus } from '../modules/entities/module.entity';

@Controller('governance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  @Get('audit')
  @Roles(UserRole.ADMIN, UserRole.MAINTAINER)
  getAuditLogs() {
    return this.governanceService.findAll();
  }
}
