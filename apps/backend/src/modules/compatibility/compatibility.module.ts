import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompatibilityService } from './services/compatibility.service';
import { StackProfileService } from './services/stack-profile.service';
import { CompatibilityController } from './controllers/compatibility.controller';
import { StackProfileController } from './controllers/stack-profile.controller';
import { CompatibilityResultEntity } from './entities/compatibility-result.entity';
import { StackProfileEntity } from './entities/stack-profile.entity';
import { ModulesModule } from '../modules/modules.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompatibilityResultEntity, StackProfileEntity]),
    ModulesModule,
  ],
  controllers: [CompatibilityController, StackProfileController],
  providers: [CompatibilityService, StackProfileService],
  exports: [CompatibilityService, StackProfileService],
})
export class CompatibilityModule {}
