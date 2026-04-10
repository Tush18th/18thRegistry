import { Controller, Post, Get, Param, Body, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { CompatibilityService } from '../services/compatibility.service';
import { TriggerAnalysisDto } from '../dto/trigger-analysis.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/entities/user.entity';

@ApiTags('Compatibility Analysis')
@ApiBearerAuth()
@Controller('compatibility')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompatibilityController {
  constructor(private readonly compatibilityService: CompatibilityService) {}

  @Post('analyze')
  @Roles(UserRole.DEVELOPER, UserRole.MAINTAINER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger a new validation analysis for a module' })
  @ApiBody({ type: TriggerAnalysisDto })
  @ApiResponse({ status: 202, description: 'Analysis triggered successfully' })
  @ApiResponse({ status: 409, description: 'Analysis already in progress' })
  async triggerAnalysis(@Body() dto: TriggerAnalysisDto) {
    return this.compatibilityService.triggerAnalysis(dto.moduleId, false);
  }

  @Post('analyze/force')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MAINTAINER)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Force trigger a validation analysis, ignoring cache' })
  @ApiBody({ type: TriggerAnalysisDto })
  @ApiResponse({ status: 202, description: 'Analysis forcefully triggered' })
  async forceTriggerAnalysis(@Body() dto: TriggerAnalysisDto) {
    return this.compatibilityService.triggerAnalysis(dto.moduleId, true);
  }

  @Get('modules/:moduleId')
  @Roles(UserRole.DEVELOPER, UserRole.MAINTAINER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Fetch the latest compatibility recommendation for a module' })
  @ApiParam({ name: 'moduleId', description: 'Module ID' })
  @ApiResponse({ status: 200, description: 'Latest compatibility result' })
  @ApiResponse({ status: 404, description: 'No analysis found' })
  async getRecommendation(@Param('moduleId', ParseUUIDPipe) moduleId: string) {
    return this.compatibilityService.getRecommendation(moduleId);
  }
}
