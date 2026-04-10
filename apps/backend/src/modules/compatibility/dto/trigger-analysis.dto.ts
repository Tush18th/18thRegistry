import { IsUUID } from 'class-validator';

export class TriggerAnalysisDto {
  @IsUUID()
  moduleId: string;
}
