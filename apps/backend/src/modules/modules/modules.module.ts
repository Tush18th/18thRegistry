import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModulesService } from './modules.service';
import { DiscoveryController } from './discovery.controller';
import { ModulesController } from './modules.controller';
import { ModuleEntity } from './entities/module.entity';
import { StructuralValidator } from '../validation/services/structural-validator.service';

@Module({
  imports: [TypeOrmModule.forFeature([ModuleEntity])],
  providers: [ModulesService, StructuralValidator],
  controllers: [DiscoveryController, ModulesController],
  exports: [ModulesService, StructuralValidator, TypeOrmModule],
})
export class ModulesModule {}
