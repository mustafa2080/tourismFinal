import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { User } from './User.js';

@Entity('admin_audit_logs')
export class AdminAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  action!: string;

  @Column({ type: 'uuid', nullable: true })
  actor_id?: string;

  @Column({ type: 'varchar', length: 255 })
  target!: string;

  @Column({ type: 'jsonb', nullable: true })
  payload?: Record<string, any>;

  @CreateDateColumn()
  created_at!: Date;

  // Relations
  @ManyToOne('User', { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'actor_id' })
  actor?: User;
}
