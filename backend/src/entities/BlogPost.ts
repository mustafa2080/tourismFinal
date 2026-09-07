import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { User } from './User.js';
import type { BlogCategory } from './BlogCategory.js';

@Entity('blog_posts')
export class BlogPost {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  excerpt?: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'text', nullable: true })
  featured_image?: string;

  @Column({ type: 'uuid', nullable: true })
  category_id?: string;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  tags!: string[];

  @Column({ type: 'boolean', default: false })
  published!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  published_at?: Date;

  @Column({ type: 'int', default: 0 })
  views_count!: number;

  @Column({ type: 'int', default: 1 })
  read_time_minutes!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  meta_title?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  meta_description?: string;

  @Column({ type: 'uuid', nullable: true })
  author_id?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne('User', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'author_id' })
  author?: User;

  @ManyToOne('BlogCategory', 'posts', { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'category_id' })
  category?: BlogCategory;
}
