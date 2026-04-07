import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { AiGenerationService, AiGenerationRequest } from './services/ai-generation.service';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('generation')
@UseGuards(JwtAuthGuard)
export class GenerationController {
  constructor(
    private readonly aiGenerationService: AiGenerationService,
  ) {}

  @Post('ai')
  async generateAi(@Body() request: AiGenerationRequest, @Res() res: Response) {
    try {
      await this.aiGenerationService.generateWithAi(request, res);
    } catch (e) {
      res.status(500).send({ message: 'Failed to generate AI content', error: e.message });
    }
  }
}
