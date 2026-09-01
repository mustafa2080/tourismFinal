import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User.js';
import { Package } from './Package.js';

@Entity('wishlist')
export class Wishlist {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'uuid' })
  package_id!: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => Package, (pkg) => pkg.id, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'package_id' })
  package?: Package;
}
