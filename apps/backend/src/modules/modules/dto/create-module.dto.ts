import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ModuleStatus } from '../entities/module.entity';

export class CreateModuleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  vendor: string;

  @IsString()
  @IsNotEmpty()
  namespace: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsEnum(ModuleStatus)
  @IsOptional()
  status?: ModuleStatus;

  @IsString()
  @IsOptional()
  magentoVersionMin?: string;

  @IsString()
  @IsOptional()
  magentoVersionMax?: string;

  @IsString()
  @IsOptional()
  phpVersionMin?: string;

  @IsString()
  @IsOptional()
  ownerUserId?: string;

  @IsString()
  @IsOptional()
  repoUrl?: string;

  @IsString()
  @IsOptional()
  repoPath?: string;

  @IsString()
  @IsOptional()
  defaultBranch?: string;
}
