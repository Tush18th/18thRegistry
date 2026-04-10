import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/entities/user.entity';
import { SandboxService } from '../services/sandbox.service';
import { LifecycleManagerService } from '../services/lifecycle-manager.service';
import { LaunchSandboxDto } from '../dto/launch-sandbox.dto';

@ApiTags('Sandbox')
@ApiBearerAuth()
@Controller('sandbox')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SandboxController {
  constructor(
    private readonly sandboxService: SandboxService,
    private readonly lifecycle: LifecycleManagerService,
  ) {}

  /**
   * POST /api/sandbox
   * Launch a new sandbox environment for module testing.
   * Dispatches a provisioning job to BullMQ and returns the session record.
   */
  @Post()
  @Roles(UserRole.DEVELOPER, UserRole.MAINTAINER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Launch a new sandbox environment for module testing' })
  @ApiResponse({ status: 202, description: 'Sandbox provisioning initiated.' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async launchSandbox(@Body() dto: LaunchSandboxDto, @Request() req: any) {
    const userId = req.user.sub;
    const session = await this.sandboxService.createSession(dto, userId);
    return {
      message: 'Sandbox provisioning initiated.',
      sessionId: session.id,
      status: session.status,
      expiresAt: session.expiresAt,
    };
  }

  /**
   * GET /api/sandbox
   * List all sandbox sessions belonging to the authenticated user.
   */
  @Get()
  @Roles(UserRole.DEVELOPER, UserRole.MAINTAINER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all sandbox sessions belonging to the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of sandboxes' })
  async listMySandboxes(@Request() req: any) {
    const userId = req.user.sub;
    return this.sandboxService.listUserSessions(userId);
  }

  /**
   * GET /api/sandbox/:id
   * Get detailed status, stack profile, endpoints, and event timeline for a sandbox.
   * Private by default — only the creator or admins can access.
   */
  @Get(':id')
  @Roles(UserRole.DEVELOPER, UserRole.MAINTAINER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get detailed status and timeline for a sandbox' })
  @ApiParam({ name: 'id', description: 'Sandbox Session ID' })
  @ApiResponse({ status: 200, description: 'Sandbox details' })
  @ApiResponse({ status: 404, description: 'Sandbox not found' })
  async getSandboxDetails(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(req.user.role);
    const session = await this.sandboxService.getSession(id, userId, isAdmin);
    const events = await this.lifecycle.getEvents(id);
    return {
      session,
      events,
    };
  }

  /**
   * DELETE /api/sandbox/:id
   * Request termination of a sandbox. Only the owner or admins can terminate.
   */
  @Delete(':id')
  @Roles(UserRole.DEVELOPER, UserRole.MAINTAINER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Request termination of a sandbox' })
  @ApiParam({ name: 'id', description: 'Sandbox Session ID' })
  @ApiResponse({ status: 202, description: 'Sandbox termination initiated.' })
  @ApiResponse({ status: 404, description: 'Sandbox not found' })
  async terminateSandbox(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(req.user.role);
    await this.sandboxService.terminateSession(id, userId, isAdmin);
    return {
      message: 'Sandbox termination initiated.',
      sessionId: id,
    };
  }
}
