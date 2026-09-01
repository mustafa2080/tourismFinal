import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import type { Package } from './Package.js';

@Entity('package_translations')
@Index(['package_id', 'language'], { unique: true })
@Index(['package_id'])
@Index(['language'])
export class PackageTranslation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  package_id!: string;

  @Column({ type: 'varchar', length: 10 })
  language!: string; // ar, en, es, ru, de

  @Column({ type: 'varchar', length: 255 })
  package_name!: string;

  @Column({ type: 'varchar', length: 500 })
  short_description!: string;

  @Column({ type: 'text' })
  detailed_description!: string;

  @Column({ type: 'text', nullable: true })
  whats_included?: string;

  @Column({ type: 'text', nullable: true })
  whats_excluded?: string;

  @Column({ type: 'text', nullable: true })
  daily_itinerary?: string;

  @Column({ type: 'text', array: true, nullable: true, default: () => "'{}'" })
  whats_included_items?: string[];

  @Column({ type: 'text', array: true, nullable: true, default: () => "'{}'" })
  whats_excluded_items?: string[];

  @Column({ type: 'text', array: true, nullable: true, default: () => "'{}'" })
  daily_itinerary_items?: string[];

  @Column({ type: 'jsonb', nullable: true })
  daily_itinerary_days?: Array<{
    day_number: number;
    title: string;
    description: string;
    activities: string;
    meals: string;
  }>;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne('Package', (pkg: Package) => pkg.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'package_id' })
  package?: Package;

  toJSON() {
    return {
      id: this.id,
      package_id: this.package_id,
      language: this.language,
      package_name: this.package_name,
      short_description: this.short_description,
      detailed_description: this.detailed_description,
      whats_included: this.whats_included || '',
      whats_excluded: this.whats_excluded || '',
      daily_itinerary: this.daily_itinerary,
      whats_included_items: this.whats_included_items || [],
      whats_excluded_items: this.whats_excluded_items || [],
      daily_itinerary_items: this.daily_itinerary_items || [],
      daily_itinerary_days: this.daily_itinerary_days || [],
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}
