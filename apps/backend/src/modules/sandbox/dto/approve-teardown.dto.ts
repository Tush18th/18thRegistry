import { IsOptional, IsString } from 'class-validator';

export class ApproveTeardownDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
