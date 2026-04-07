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
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('modules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DiscoveryController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get('search')
  async search(
    @Query('query') query: string,
    @Query('vendor') vendor: string,
    @Request() req: any
  ) {
    return this.modulesService.search(query, vendor, req.user?.role);
  }

  @Get('stats')
  async getStats() {
    return this.modulesService.getStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.modulesService.findOne(id);
  }

  @Post('register-manual')
  @Roles(UserRole.ADMIN, UserRole.MAINTAINER)
  async registerManual(@Body() dto: CreateModuleDto) {
    // This provides a way for admins to manually register existing verified modules
    return this.modulesService.create(dto);
  }
}
