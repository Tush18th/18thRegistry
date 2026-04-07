import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('generation_request')
export class GenerationRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column('jsonb')
  baseModuleIds: string[];

  @Column('text')
  promptText: string;

  @Column({ nullable: true })
  generatedCodeUrl?: string;

  @Column({ default: 'pending' })
  validationStatus: string;

  @Column({ default: 'pending' })
  exportStatus: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
