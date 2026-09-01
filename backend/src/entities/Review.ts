import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User.js';
import { Package } from './Package.js';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'uuid' })
  package_id!: string;

  @Column({ type: 'integer', default: 5 })
  rating!: number;

  @Column({ type: 'text' })
  comment!: string;

  @Column({ type: 'boolean', default: false })
  approved!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => User, user => user.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Package, pkg => pkg.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'package_id' })
  package!: Package;
}
