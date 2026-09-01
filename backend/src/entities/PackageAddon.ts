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
import { Package } from './Package.js';
import { PackageAddonTranslation } from './PackageAddonTranslation.js';

@Entity('package_addons')
export class PackageAddon {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  package_id!: string;

  @Column({ type: 'boolean', default: true })
  is_available!: boolean;

  @Column({ type: 'integer', default: 1 })
  min_quantity!: number;

  @Column({ type: 'integer', default: 1 })
  max_quantity!: number;

  @Column({ type: 'integer', default: 0 })
  sort_order!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'varchar', length: 50, default: 'addon' })
  category!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Package, pkg => pkg.addons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'package_id' })
  package!: Package;

  @OneToMany(() => PackageAddonTranslation, translation => translation.addon, { cascade: true })
  translations!: PackageAddonTranslation[];
}
