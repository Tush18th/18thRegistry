import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionController } from './ingestion.controller';
import { IngestionProcessor } from './ingestion.processor';
import { GitService } from './services/git.service';
import { ParserService } from './services/parser.service';
import { PersistenceService } from './services/persistence.service';
import { ModulesModule } from '../modules/modules.module';

@Module({
  imports: [
    ModulesModule,
    BullModule.registerQueue({
      name: 'repo-sync-vnew',
    }),
  ],
  controllers: [IngestionController],
  providers: [
    IngestionProcessor,
    GitService,
    ParserService,
    PersistenceService,
  ],
  exports: [BullModule, GitService, ParserService],
})
export class IngestionModule {}
