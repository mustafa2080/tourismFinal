import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { Booking } from './Booking.js';

@Entity('booking_extras')
export class BookingExtra {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  booking_id!: string;

  @Column({ type: 'varchar', length: 100 })
  extra_key!: string;

  @Column({ type: 'varchar', length: 255 })
  extra_name!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'integer', default: 1 })
  quantity!: number;

  @CreateDateColumn()
  created_at!: Date;

  // Relations
  @ManyToOne('Booking', (booking: Booking) => booking.extras, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking!: Booking;
}
