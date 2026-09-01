import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Booking } from './Booking.js';
import { Review } from './Review.js';
import { Notification } from './Notification.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash!: string;

  @Column({ type: 'varchar', length: 20, default: 'customer' })
  role!: 'customer' | 'admin' | 'banned';

  @Column({ type: 'text', nullable: true })
  avatar?: string;

  @Column({ type: 'bytea', nullable: true })
  profileImage?: Buffer;

  @Column({ type: 'varchar', length: 50, nullable: true })
  profileImageMimeType?: string;

  @Column({ type: 'boolean', default: false })
  is_verified!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  verification_token?: string;

  // 🔐 Password Reset Fields
  @Column({ type: 'varchar', length: 255, nullable: true })
  reset_token?: string;

  @Column({ type: 'timestamp', nullable: true })
  reset_token_expires?: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @OneToMany(() => Booking, booking => booking.user)
  bookings!: Booking[];

  @OneToMany(() => Review, review => review.user)
  reviews!: Review[];

  @OneToMany(() => Notification, notification => notification.user)
  notifications!: Notification[];
}
