import { IsOptional, IsString, IsArray } from 'class-validator';

export class SearchModuleDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsString()
  vendor?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  capabilities?: string[];
}
