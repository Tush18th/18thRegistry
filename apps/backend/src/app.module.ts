import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AppDataSource } from './data-source';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { ModulesModule } from './modules/modules/modules.module';
import { GenerationModule } from './modules/generation/generation.module';
import { GovernanceModule } from './modules/governance/governance.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { CloneAdaptModule } from './modules/clone-adapt/clone-adapt.module';
import { ExportModule } from './modules/export/export.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    AuthModule,
    ModulesModule,
    GenerationModule,
    GovernanceModule,
    IngestionModule,
    CloneAdaptModule,
    ExportModule,
  ],
})
export class AppModule {}