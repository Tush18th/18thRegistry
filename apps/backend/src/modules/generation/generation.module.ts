import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenerationController } from './generation.controller';
import { AiGenerationService } from './services/ai-generation.service';
import { PromptService } from './services/prompt.service';
import { ClaudeService } from './services/claude.service';
import { PatternService } from './services/pattern.service';
import { ModulesModule } from '../modules/modules.module';
import { ValidationModule } from '../validation/validation.module';
import { IngestionModule } from '../ingestion/ingestion.module';
import { GenerationRequest } from './entities/generation-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GenerationRequest]),
    ModulesModule,
    ValidationModule,
    IngestionModule,
  ],
  controllers: [GenerationController],
  providers: [
    AiGenerationService,
    PromptService,
    ClaudeService,
    PatternService,
  ],
  exports: [AiGenerationService, ClaudeService],
})
export class GenerationModule {}
