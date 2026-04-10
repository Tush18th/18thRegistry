import { Controller, Post, Body, Param, Res, Header, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { CloneAdaptService } from './services/clone-adapt.service';
import { TransformationConfig } from './services/transformation.service';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Generative Tools')
@ApiBearerAuth()
@Controller('clone-adapt')
@UseGuards(JwtAuthGuard)
export class CloneAdaptController {
  constructor(private readonly cloneAdaptService: CloneAdaptService) {}

  @Post(':id')
  @Header('Content-Type', 'application/zip')
  @ApiOperation({ summary: 'Clone and adapt a Magento module' })
  @ApiParam({ name: 'id', description: 'Source Module ID (UUID)' })
  @ApiBody({ type: TransformationConfig, description: 'Configuration for adaptation (e.g. namespace, name overrides)' })
  @ApiResponse({ status: 201, description: 'A ZIP file containing the adapted module', content: { 'application/zip': {} } })
  @ApiResponse({ status: 404, description: 'Module or repository URL not found' })
  @ApiResponse({ status: 400, description: 'Invalid UUID or payload validation failure' })
  @ApiResponse({ status: 500, description: 'Clone & Adapt failed — internal error' })
  async cloneAndAdapt(
    @Param('id', ParseUUIDPipe) moduleId: string,
    @Body() config: TransformationConfig,
    @Res() res: Response
  ) {
    // Let HttpExceptions (404, 400, etc.) propagate to the global filter naturally.
    // Only wrap genuine unexpected errors to preserve their message for debugging.
    await this.cloneAdaptService.cloneAndAdapt(moduleId, config, res);
  }
}
