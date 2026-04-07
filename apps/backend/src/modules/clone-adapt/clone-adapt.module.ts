import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloneAdaptController } from './clone-adapt.controller';
import { CloneAdaptService } from './services/clone-adapt.service';
import { TransformationService } from './services/transformation.service';
import { IngestionModule } from '../ingestion/ingestion.module';
import { ModulesModule } from '../modules/modules.module';
import { ValidationModule } from '../validation/validation.module';

@Module({
  imports: [
    IngestionModule,
    ModulesModule,
    ValidationModule
  ],
  controllers: [CloneAdaptController],
  providers: [CloneAdaptService, TransformationService],
})
export class CloneAdaptModule {}
