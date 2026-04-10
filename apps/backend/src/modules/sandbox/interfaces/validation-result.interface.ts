export type ValidationStatus = 'passed' | 'failed' | 'warning';

export interface RuntimeCheckResult {
  name: string;
  status: ValidationStatus;
  message?: string;
  details?: any;
}

export interface ValidationResult {
  status: ValidationStatus;
  checks: RuntimeCheckResult[];
  summary: string;
}
