import { IsString, IsNotEmpty } from 'class-validator';

export class ForceDestroyDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}
