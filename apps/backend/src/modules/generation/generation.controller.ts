import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AiGenerationService, AiGenerationRequest } from './services/ai-generation.service';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Generative Tools')
@ApiBearerAuth()
@Controller('generation')
@UseGuards(JwtAuthGuard)
export class GenerationController {
  constructor(
    private readonly aiGenerationService: AiGenerationService,
  ) {}

  @Post('ai')
  @ApiOperation({ summary: 'Generate a Magento module using AI based on context and references' })
  @ApiBody({ type: AiGenerationRequest })
  @ApiResponse({ status: 201, description: 'A ZIP file containing the AI generated code', content: { 'application/zip': {} } })
  @ApiResponse({ status: 500, description: 'Failed to generate AI content' })
  async generateAi(@Body() request: AiGenerationRequest, @Res() res: Response) {
    try {
      await this.aiGenerationService.generateWithAi(request, res);
    } catch (e) {
      res.status(500).send({ message: 'Failed to generate AI content', error: e.message });
    }
  }
}
