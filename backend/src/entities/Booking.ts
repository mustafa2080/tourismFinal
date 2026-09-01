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
import { User } from './User.js';
import { Package } from './Package.js';
import { BookingExtra } from './BookingExtra.js';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'uuid' })
  package_id!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  booking_number!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'confirmed',
  })
  status!: 'confirmed' | 'completed' | 'cancelled';

  @Column({ type: 'integer' })
  persons!: number;

  @Column({ type: 'date' })
  date_start!: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total_price!: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'on_arrival',
  })
  payment_type!: 'on_arrival' | 'deposit' | 'full_payment';

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  invoice_url?: string;

  // Refund Fields
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  refund_amount!: number;

  @Column({ type: 'text', nullable: true })
  refund_reason?: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
    nullable: true,
  })
  refund_status?: 'pending' | 'approved' | 'rejected' | 'processed';

  @Column({ type: 'timestamp', nullable: true })
  refund_processed_at?: Date;

  @Column({ type: 'uuid', nullable: true })
  refund_processed_by?: string;

  @Column({ type: 'text', nullable: true })
  refund_notes?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => User, user => user.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Package, pkg => pkg.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'package_id' })
  package!: Package;

  @OneToMany(() => BookingExtra, extra => extra.booking, { cascade: true })
  extras!: BookingExtra[];
}
