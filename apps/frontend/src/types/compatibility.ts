export enum AnalysisStatus {
  QUEUED = 'queued',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ConfidenceLevel {
  EXPLICIT = 'EXPLICIT',
  STRONG_INFERENCE = 'STRONG_INFERENCE',
  WEAK_INFERENCE = 'WEAK_INFERENCE',
  UNKNOWN = 'UNKNOWN',
}

export interface CompatibilityResult {
  id: string;
  moduleId: string;
  status: AnalysisStatus;
  magentoRecommendation?: {
    recommended: string;
    supportedRange: string;
    reason?: string;
  };
  phpRecommendation?: {
    minimum: string;
    recommended: string;
    featuresDetected?: string[];
  };
  infrastructure?: Array<{
    service: string;
    requirement: 'REQUIRED' | 'OPTIONAL' | 'INFERRED';
  }>;
  warnings?: Array<{
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    type: string;
    message: string;
  }>;
  confidenceScore?: {
    score: number;
    level: ConfidenceLevel;
  };
  stale: boolean;
  createdAt: string;
}
