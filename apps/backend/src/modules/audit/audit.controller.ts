import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  async getLogs(
    @Query('limit') limitStr?: string,
    @Query('skip') skipStr?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : 100;
    const skip = skipStr ? parseInt(skipStr, 10) : 0;
    
    const [data, total] = await this.auditService.getLogs(limit, skip);
    return { data, total };
  }
}
