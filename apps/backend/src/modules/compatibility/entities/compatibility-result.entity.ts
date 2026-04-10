import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

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

@Entity('compatibility_results')
export class CompatibilityResultEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  moduleId: string;

  @Column({
    type: 'enum',
    enum: AnalysisStatus,
    default: AnalysisStatus.QUEUED,
  })
  status: AnalysisStatus;

  @Column('jsonb', { nullable: true })
  magentoRecommendation: {
    recommended: string;
    supportedRange: string;
    reason?: string;
  };

  @Column('jsonb', { nullable: true })
  phpRecommendation: {
    minimum: string;
    recommended: string;
    featuresDetected?: string[];
    conflicts?: string[];
  };

  @Column('jsonb', { nullable: true })
  infrastructure: Array<{
    service: string;
    requirement: 'REQUIRED' | 'OPTIONAL' | 'INFERRED';
    reason?: string;
  }>;

  @Column('jsonb', { nullable: true })
  warnings: Array<{
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    type: string;
    message: string;
    file?: string;
  }>;

  @Column('jsonb', { nullable: true })
  confidenceScore: {
    score: number;
    level: ConfidenceLevel;
    breakdown?: Record<string, number>;
  };

  @Column('jsonb', { nullable: true })
  evidence: string[];

  @Column({ default: false })
  stale: boolean;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
