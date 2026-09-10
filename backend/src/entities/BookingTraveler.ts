import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { Booking } from './Booking.js';

@Entity('booking_travelers')
export class BookingTraveler {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  booking_id!: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  traveler_type!: 'adult' | 'child' | 'infant';

  @Column({ type: 'varchar', length: 150 })
  full_name!: string;

  @Column({ type: 'varchar', length: 100 })
  nationality!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  passport_number?: string;

  @Column({ type: 'date' })
  date_of_birth!: Date;

  @Column({ type: 'integer', default: 0 })
  sort_order!: number;

  @CreateDateColumn()
  created_at!: Date;

  // Relations
  @ManyToOne('Booking', (booking: Booking) => booking.travelers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking!: Booking;
}
