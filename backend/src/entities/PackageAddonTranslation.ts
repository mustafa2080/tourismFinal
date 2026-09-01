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
import { PackageAddon } from './PackageAddon.js';

@Entity('package_addon_translations')
@Index(['addon_id', 'language'], { unique: true })
@Index(['addon_id'])
@Index(['language'])
export class PackageAddonTranslation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  addon_id!: string;

  @Column({ type: 'varchar', length: 10 })
  language!: string; // ar, en, es, de, ru

  @Column({ type: 'varchar', length: 100 })
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

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => PackageAddon, addon => addon.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'addon_id' })
  addon?: PackageAddon;

  toJSON() {
    return {
      id: this.id,
      addon_id: this.addon_id,
      language: this.language,
      package_name: this.package_name,
      short_description: this.short_description,
      detailed_description: this.detailed_description,
      whats_included: this.whats_included || '',
      whats_excluded: this.whats_excluded || '',
      daily_itinerary: this.daily_itinerary,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}
