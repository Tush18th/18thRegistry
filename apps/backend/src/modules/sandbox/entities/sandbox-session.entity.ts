import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SandboxStatus } from '../enums/sandbox-status.enum';
import { ModuleEntity } from '../../modules/entities/module.entity';
import { ValidationResult } from '../interfaces/validation-result.interface';

@Entity('sandbox_sessions')
export class SandboxSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  moduleId: string;

  @Column()
  @Index()
  userId: string;

  @Column({
    type: 'enum',
    enum: SandboxStatus,
    default: SandboxStatus.REQUESTED,
  })
  @Index()
  status: SandboxStatus;

  @Column('jsonb')
  stackProfile: {
    magentoVersion: string;
    phpVersion: string;
    services: string[];
  };

  @Column('jsonb', { nullable: true })
  endpoints: {
    storefront?: string;
    admin?: string;
  };

  @Column('jsonb', { nullable: true })
  validationResults: ValidationResult;

  @Column({ default: 'unknown' })
  healthStatus: string;

  @Column({ default: 0 })
  extensionCount: number;

  @Column({ default: 0 })
  @Index()
  cumulativeDurationMinutes: number;

  @Column('text', { nullable: true })
  remediationSuggestion: string;

  @Column('jsonb', { nullable: true })
  troubleshootingContext: any;

  @Column('text', { nullable: true })
  @Index()
  failureReason: string;

  @Column({ nullable: true })
  @Index()
  failureStage: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ModuleEntity)
  @JoinColumn({ name: 'moduleId' })
  module: ModuleEntity;
}
