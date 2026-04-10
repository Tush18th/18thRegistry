import {
  IsUUID,
  IsObject,
  IsString,
  IsArray,
  IsOptional,
  IsInt,
  IsBoolean,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class StackOverrideDto {
  @IsOptional()
  @IsString()
  magentoVersion?: string;

  @IsOptional()
  @IsString()
  phpVersion?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];
}

class SandboxOptionsDto {
  @IsOptional()
  @IsBoolean()
  autoAcceptRecommendation?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(8)
  ttlHours?: number;
}

export class CreateSandboxDto {
  @IsUUID()
  moduleId: string;

  @IsOptional()
  @IsString()
  stackProfileId?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => StackOverrideDto)
  stackOverride?: StackOverrideDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SandboxOptionsDto)
  options?: SandboxOptionsDto;
}
