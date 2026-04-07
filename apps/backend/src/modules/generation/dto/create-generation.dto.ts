import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGenerationDto {
  @IsArray()
  @IsOptional()
  baseModuleIds?: string[];

  @IsString()
  @IsNotEmpty()
  promptText: string;
}
