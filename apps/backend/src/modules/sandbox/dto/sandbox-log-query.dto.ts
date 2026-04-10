import { IsOptional, IsString, IsInt, IsISO8601, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SandboxLogQueryDto {
  @IsOptional()
  @IsString()
  stage?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsISO8601()
  since?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 200;
}

export class SandboxEventQueryDto {
  @IsOptional()
  @IsISO8601()
  since?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 100;
}
