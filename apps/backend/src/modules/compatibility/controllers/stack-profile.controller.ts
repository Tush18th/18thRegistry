import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { StackProfileService } from '../services/stack-profile.service';
import { StackProfileStatus } from '../entities/stack-profile.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/entities/user.entity';

@ApiTags('Stack Profiles')
@ApiBearerAuth()
@Controller('stack-profiles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StackProfileController {
  constructor(private readonly stackProfileService: StackProfileService) {}

  @Get()
  @Roles(UserRole.DEVELOPER, UserRole.MAINTAINER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all available Magento stack environment profiles' })
  @ApiQuery({ name: 'magentoVersion', required: false })
  @ApiQuery({ name: 'phpVersion', required: false })
  @ApiQuery({ name: 'status', required: false, enum: StackProfileStatus })
  @ApiResponse({ status: 200, description: 'List of environment profiles' })
  async findAll(
    @Query('magentoVersion') magentoVersion?: string,
    @Query('phpVersion') phpVersion?: string,
    @Query('status') status?: StackProfileStatus,
  ) {
    return this.stackProfileService.findAll({ magentoVersion, phpVersion, status });
  }

  @Get(':id')
  @Roles(UserRole.DEVELOPER, UserRole.MAINTAINER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get details of a specific stack profile' })
  @ApiParam({ name: 'id', description: 'Profile ID' })
  @ApiResponse({ status: 200, description: 'Profile details' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async findOne(@Param('id') id: string) {
    return this.stackProfileService.findOne(id);
  }
}
