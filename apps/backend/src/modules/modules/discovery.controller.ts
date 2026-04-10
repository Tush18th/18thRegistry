import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query, 
  UseGuards, 
  Request,
  Param
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@ApiTags('Discovery')
@ApiBearerAuth()
@Controller('modules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DiscoveryController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search for modules' })
  @ApiQuery({ name: 'query', required: false, type: String, description: 'Search term for name or description' })
  @ApiQuery({ name: 'vendor', required: false, type: String, description: 'Filter by vendor' })
  @ApiResponse({ status: 200, description: 'List of matching modules' })
  async search(
    @Query('query') query: string,
    @Query('vendor') vendor: string,
    @Request() req: any
  ) {
    return this.modulesService.search(query, vendor, req.user?.role);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get module statistics' })
  @ApiResponse({ status: 200, description: 'Statistics of registry modules' })
  async getStats() {
    return this.modulesService.getStats();
  }

  @Post('register-manual')
  @Roles(UserRole.ADMIN, UserRole.MAINTAINER)
  @ApiOperation({ summary: 'Manually register a module' })
  @ApiResponse({ status: 201, description: 'Module manually registered successfully' })
  async registerManual(@Body() dto: CreateModuleDto) {
    // This provides a way for admins to manually register existing verified modules
    return this.modulesService.create(dto);
  }
}
