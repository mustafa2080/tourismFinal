import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Package } from './Package.js';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  image?: string;

  @CreateDateColumn()
  created_at!: Date;

  // Relations
  // ManyToMany: Category can have multiple packages through package_categories table
  @ManyToMany(() => Package, pkg => pkg.categories)
  packages_many!: Package[];

  // OneToMany: Category can have multiple packages as primary category
  @OneToMany(() => Package, pkg => pkg.category)
  packages!: Package[];
}
