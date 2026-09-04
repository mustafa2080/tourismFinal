/// <reference types="express" />
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Admin-managed catalog of items a customer can pick from while
 * building a Custom Trip: activities, hotels, transport, meals.
 * Independent from the Packages catalog.
 */
@Entity('trip_builder_options')
export class TripBuilderOption {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 20 })
  item_type!: 'activity' | 'hotel' | 'transport' | 'meal';

  @Column({ type: 'varchar', length: 150 })
  destination!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price!: number;

  // e.g. 'per_person', 'per_night', 'per_booking'
  @Column({ type: 'varchar', length: 20, default: 'per_person' })
  price_unit!: 'per_person' | 'per_night' | 'per_booking';

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  tags!: string[];

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @Column({ type: 'integer', default: 0 })
  sort_order!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
