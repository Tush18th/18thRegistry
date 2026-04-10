import { IsOptional, IsUUID, IsISO8601 } from 'class-validator';
import { ListSandboxesQueryDto } from './list-sandboxes-query.dto';

export class AdminListSandboxesQueryDto extends ListSandboxesQueryDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsISO8601()
  stuckSince?: string;
}
