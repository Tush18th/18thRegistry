import {
  IsUUID,
  IsObject,
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class StackProfileDto {
  @IsString()
  magentoVersion: string;

  @IsString()
  phpVersion: string;

  @IsArray()
  @IsString({ each: true })
  services: string[];
}

export class LaunchSandboxDto {
  @IsUUID()
  moduleId: string;

  @IsObject()
  @ValidateNested()
  @Type(() => StackProfileDto)
  stackProfile: StackProfileDto;
}
