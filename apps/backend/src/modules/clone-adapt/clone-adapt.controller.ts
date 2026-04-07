import { Controller, Post, Body, Param, Res, Header, UseGuards } from '@nestjs/common';
import { CloneAdaptService } from './services/clone-adapt.service';
import { TransformationConfig } from './services/transformation.service';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('clone-adapt')
export class CloneAdaptController {
  constructor(private readonly cloneAdaptService: CloneAdaptService) {}

  @Post(':id')
  @Header('Content-Type', 'application/zip')
  async cloneAndAdapt(
    @Param('id') moduleId: string,
    @Body() config: TransformationConfig,
    @Res() res: Response
  ) {
    try {
      await this.cloneAdaptService.cloneAndAdapt(moduleId, config, res);
    } catch (e) {
      res.status(500).send({ message: 'Clone & Adapt failed', error: e.message });
    }
  }
}
