import { IsInt, IsString, Min, Max } from 'class-validator';

export class RequestExtensionDto {
  @IsInt()
  @Min(1)
  @Max(4)
  extensionHours: number;

  @IsString()
  reason: string;
}
