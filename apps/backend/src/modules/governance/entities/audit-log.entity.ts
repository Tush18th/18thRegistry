import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  moduleId?: string;

  @Column('jsonb', { default: '{}' })
  details: Record<string, unknown>;

  @CreateDateColumn()
  timestamp: Date;
}
