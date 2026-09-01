import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Package } from './Package.js';

@Entity('itineraries')
export class Itinerary {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  package_id!: string;

  @Column({ type: 'integer' })
  day_number!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url?: string;

  @Column({ type: 'text', nullable: true })
  activities?: string;

  @Column({ type: 'text', nullable: true })
  meals?: string;

  // English translations
  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  en_title?: string;

  @Column({ type: 'text', nullable: true, default: null })
  en_description?: string;

  @Column({ type: 'text', nullable: true, default: null })
  en_activities?: string;

  @Column({ type: 'text', nullable: true, default: null })
  en_meals?: string;

  // Arabic translations
  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  ar_title?: string;

  @Column({ type: 'text', nullable: true, default: null })
  ar_description?: string;

  @Column({ type: 'text', nullable: true, default: null })
  ar_activities?: string;

  @Column({ type: 'text', nullable: true, default: null })
  ar_meals?: string;

  // Spanish translations
  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  es_title?: string;

  @Column({ type: 'text', nullable: true, default: null })
  es_description?: string;

  @Column({ type: 'text', nullable: true, default: null })
  es_activities?: string;

  @Column({ type: 'text', nullable: true, default: null })
  es_meals?: string;

  // German translations
  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  de_title?: string;

  @Column({ type: 'text', nullable: true, default: null })
  de_description?: string;

  @Column({ type: 'text', nullable: true, default: null })
  de_activities?: string;

  @Column({ type: 'text', nullable: true, default: null })
  de_meals?: string;

  // Russian translations
  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  ru_title?: string;

  @Column({ type: 'text', nullable: true, default: null })
  ru_description?: string;

  @Column({ type: 'text', nullable: true, default: null })
  ru_activities?: string;

  @Column({ type: 'text', nullable: true, default: null })
  ru_meals?: string;

  @CreateDateColumn()
  created_at!: Date;

  // Relations
  @ManyToOne(() => Package, pkg => pkg.itineraries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'package_id' })
  package!: Package;

  toJSON() {
    // Use English translations as fallback
    const en_title_val = this.en_title || this.title || '';
    const en_description_val = this.en_description || this.description || '';
    const en_activities_val = this.en_activities || this.activities || '';
    const en_meals_val = this.en_meals || this.meals || '';

    return {
      id: this.id,
      package_id: this.package_id,
      day_number: this.day_number,
      day: this.day_number, // Alias for compatibility
      title: this.title,
      description: this.description,
      image_url: this.image_url,
      activities: this.activities,
      meals: this.meals,
      created_at: this.created_at,
      // English translations
      en_title: en_title_val,
      en_description: en_description_val,
      en_activities: en_activities_val,
      en_meals: en_meals_val,
      // Arabic translations with fallbacks to English translations
      ar_title: this.ar_title || en_title_val || '',
      ar_description: this.ar_description || en_description_val || '',
      ar_activities: this.ar_activities || en_activities_val || '',
      ar_meals: this.ar_meals || en_meals_val || '',
      // Spanish translations with fallbacks to English translations
      es_title: this.es_title || en_title_val || '',
      es_description: this.es_description || en_description_val || '',
      es_activities: this.es_activities || en_activities_val || '',
      es_meals: this.es_meals || en_meals_val || '',
      // German translations with fallbacks to English translations
      de_title: this.de_title || en_title_val || '',
      de_description: this.de_description || en_description_val || '',
      de_activities: this.de_activities || en_activities_val || '',
      de_meals: this.de_meals || en_meals_val || '',
      // Russian translations with fallbacks to English translations
      ru_title: this.ru_title || en_title_val || '',
      ru_description: this.ru_description || en_description_val || '',
      ru_activities: this.ru_activities || en_activities_val || '',
      ru_meals: this.ru_meals || en_meals_val || '',
    };
  }
}
