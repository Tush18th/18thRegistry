import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ModuleStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  DEPRECATED = 'deprecated',
  ARCHIVED = 'archived',
}

@Entity('module')
export class ModuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  name: string;

  @Column()
  @Index()
  vendor: string;

  @Column({ unique: true })
  @Index()
  namespace: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  @Index()
  category: string;

  @Column({
    type: 'enum',
    enum: ModuleStatus,
    default: ModuleStatus.DRAFT,
  })
  @Index()
  status: ModuleStatus;

  @Column({ nullable: true })
  magentoVersionMin: string;

  @Column({ nullable: true })
  phpVersionMin: string;

  @Column({ nullable: true })
  ownerUserId: string;

  @Column({ nullable: true })
  repoUrl?: string;

  @Column({ nullable: true })
  repoPath?: string;

  @Column({ default: 'master' })
  defaultBranch: string;

  @Column('jsonb', { nullable: true })
  dependencies?: Record<string, string>;

  @Column('jsonb', { nullable: true })
  capabilities?: string[];

  @Column('jsonb', { nullable: true })
  fileStructure?: any;

  @Column({ default: '1.0.0' })
  version: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
