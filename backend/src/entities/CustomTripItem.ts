/// <reference types="express" />
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { CustomTripRequest } from './CustomTripRequest.js';

/**
 * A single chosen item inside a custom trip request:
 * an activity, a hotel, a transport option, or a meal plan
 * the customer added while building their trip.
 */
@Entity('custom_trip_items')
export class CustomTripItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  request_id!: string;

  @Column({ type: 'varchar', length: 20 })
  item_type!: 'activity' | 'hotel' | 'transport' | 'meal';

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image?: string;

  @Column({ type: 'integer', default: 1 })
  quantity!: number;

  // Unit price snapshot at the time it was added (USD)
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  unit_price!: number;

  @Column({ type: 'integer', default: 0 })
  day_number!: number;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne('CustomTripRequest', (r: CustomTripRequest) => r.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request!: CustomTripRequest;
}
