import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AuditAction {
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_ROLE_UPDATED = 'USER_ROLE_UPDATED',
  USER_STATUS_UPDATED = 'USER_STATUS_UPDATED',
}

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  actorId: string; // Unified ID of the user performing the action (was userId in governance)

  @Column()
  action: string; // Flexible action string (was enum)

  @Column({ nullable: true })
  targetResource: string; // e.g., 'USER', 'MODULE'

  @Column({ nullable: true })
  targetId: string; // Unified ID of the affected resource (was moduleId in governance)

  @Column({ type: 'jsonb', nullable: true, default: '{}' })
  details: any; // Unified payload/changes field

  @Column({ nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  createdAt: Date; // Unified timestamp
}
