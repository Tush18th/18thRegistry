import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { SandboxEventType } from '../enums/sandbox-event-type.enum';

@Entity('sandbox_events')
export class SandboxEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  sessionId: string;

  @Column({
    type: 'enum',
    enum: SandboxEventType,
  })
  type: SandboxEventType;

  @Column('text')
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  details: any;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
