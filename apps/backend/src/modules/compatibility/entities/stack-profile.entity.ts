import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum StackProfileStatus {
  ACTIVE = 'active',
  DEPRECATED = 'deprecated',
  EXPERIMENTAL = 'experimental',
}

@Entity('stack_profiles')
export class StackProfileEntity {
  @PrimaryColumn()
  id: string; // e.g., 'm246-php82'

  @Column()
  magentoVersion: string; // e.g., '2.4.6-p3'

  @Column()
  phpVersion: string; // e.g., '8.2'

  @Column({ nullable: true })
  dbVersion: string; // e.g., 'MariaDB 10.6'

  @Column({ nullable: true })
  searchEngine: string; // e.g., 'OpenSearch 2.x'

  @Column({ nullable: true })
  redisVersion: string; // e.g., '7.x'

  @Column({ default: false })
  rabbitmqAvailable: boolean;

  @Column({
    type: 'enum',
    enum: StackProfileStatus,
    default: StackProfileStatus.ACTIVE,
  })
  status: StackProfileStatus;

  @Column({ type: 'date', nullable: true })
  supportedUntil: Date;

  @Column({ nullable: true })
  notes: string;

  @Column('jsonb', { nullable: true })
  dockerImages: {
    phpFpm?: string;
    nginx?: string;
    elasticsearch?: string; // or opensearch
    db?: string;
    redis?: string;
    rabbitmq?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
