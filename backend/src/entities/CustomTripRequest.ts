/// <reference types="express" />
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import type { User } from './User.js';
import { CustomTripItem } from './CustomTripItem.js';

/**
 * Custom Trip Request — a fully self-built trip a customer assembles
 * from scratch (destination, dates, travelers, and a set of chosen
 * items: activities / hotels / transport / meals), independent from
 * the existing pre-made Packages system.
 */
@Entity('custom_trip_requests')
export class CustomTripRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  request_number!: string;

  @Column({ type: 'uuid', nullable: true })
  user_id?: string;

  // Guest contact info (used when user_id is null, or kept as a snapshot either way)
  @Column({ type: 'varchar', length: 255 })
  contact_name!: string;

  @Column({ type: 'varchar', length: 255 })
  contact_email!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  contact_phone?: string;

  @Column({ type: 'varchar', length: 150 })
  destination!: string;

  @Column({ type: 'date' })
  date_start!: Date;

  @Column({ type: 'date' })
  date_end!: Date;

  @Column({ type: 'integer' })
  adults!: number;

  @Column({ type: 'integer', default: 0 })
  children!: number;

  @Column({ type: 'varchar', length: 20, default: 'mid_range' })
  budget_tier!: 'budget' | 'mid_range' | 'luxury';

  @Column({ type: 'varchar', length: 20, default: 'standard' })
  pace!: 'relaxed' | 'standard' | 'packed';

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  interests!: string[];

  @Column({ type: 'text', nullable: true })
  special_requests?: string;

  // Snapshot pricing (USD, source of truth)
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  estimated_total!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  display_currency!: 'USD' | 'EGP';

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  display_total?: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'submitted',
  })
  status!: 'draft' | 'submitted' | 'reviewing' | 'quoted' | 'accepted' | 'rejected' | 'converted' | 'cancelled';

  // Admin-side handling
  @Column({ type: 'text', nullable: true })
  admin_notes?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  quoted_price?: number;

  @Column({ type: 'text', nullable: true })
  quote_message?: string;

  @Column({ type: 'uuid', nullable: true })
  handled_by?: string;

  @Column({ type: 'timestamp', nullable: true })
  responded_at?: Date;

  // If the request gets turned into a real booking later
  @Column({ type: 'uuid', nullable: true })
  converted_booking_id?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne('User', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @OneToMany(() => CustomTripItem, item => item.request, { cascade: true, eager: true })
  items!: CustomTripItem[];
}
