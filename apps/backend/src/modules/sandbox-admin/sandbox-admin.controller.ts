import { Controller, Get, Post, Param, Query, Body, UseGuards, Request, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { SandboxAdminService } from './services/sandbox-admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { AdminListSandboxesQueryDto } from '../sandbox/dto/admin-list-sandboxes-query.dto';
import { ForceDestroyDto } from '../sandbox/dto/force-destroy.dto';

@ApiTags('Sandbox Administration')
@ApiBearerAuth()
@Controller('sandbox-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SandboxAdminController {
  constructor(private readonly sandboxAdminService: SandboxAdminService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all sandboxes across the platform' })
  @ApiResponse({ status: 200, description: 'Paginated list of sandboxes' })
  async findAll(@Query() query: AdminListSandboxesQueryDto) {
    return this.sandboxAdminService.findAll(query);
  }

  @Get('metrics')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get aggregated sandbox infrastructure metrics' })
  @ApiResponse({ status: 200, description: 'Sandbox health summary' })
  async getMetrics() {
    return this.sandboxAdminService.getHealthSummary();
  }

  @Post(':id/teardown')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Manual force-kill for an environment' })
  @ApiParam({ name: 'id', description: 'Sandbox Session ID' })
  @ApiBody({ type: ForceDestroyDto })
  @ApiResponse({ status: 202, description: 'Teardown initiated.' })
  @ApiResponse({ status: 404, description: 'Sandbox not found.' })
  async forceDestroy(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ForceDestroyDto,
    @Request() req: any
  ) {
    await this.sandboxAdminService.forceDestroy(id, req.user.sub, dto.reason);
    return { message: 'Force teardown initiated.', sessionId: id };
  }

  @Post(':id/retry')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Retry a failed sandbox provisioning job' })
  @ApiParam({ name: 'id', description: 'Sandbox Session ID' })
  @ApiResponse({ status: 202, description: 'Retry initiated.' })
  @ApiResponse({ status: 404, description: 'Sandbox not found.' })
  async retryFailed(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any
  ) {
    await this.sandboxAdminService.retryFailed(id, req.user.sub);
    return { message: 'Retry initiated.', sessionId: id };
  }
}
