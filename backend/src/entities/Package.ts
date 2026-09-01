import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  ManyToOne,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { PackageImage } from './PackageImage.js';
import { Itinerary } from './Itinerary.js';
import { Booking } from './Booking.js';
import { Review } from './Review.js';
import { Category } from './Category.js';
import { PackageAddon } from './PackageAddon.js';
import { PackageTranslation } from './PackageTranslation.js';

@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 255 })
  destination!: string;

  @Column({ type: 'uuid', nullable: true })
  category_id?: string;

  @Column({ type: 'integer' })
  duration_days!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  base_price!: number;

  @Column({ type: 'varchar', length: 500 })
  short_desc!: string;

  @Column({ type: 'text' })
  long_desc!: string;

  @Column({ type: 'boolean', default: false })
  featured!: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  average_rating!: number;

  @Column({ type: 'text', nullable: true })
  trip_type?: string;

  @Column({ type: 'integer', default: 0 })
  booking_count!: number;

  @Column({ type: 'integer', default: 0 })
  review_count?: number;

  @Column({ type: 'bytea', nullable: true })
  images_data?: Buffer;

  @Column({ type: 'text', array: true, nullable: true, default: () => "'{}'" })
  inclusions?: string[];

  @Column({ type: 'text', array: true, nullable: true, default: () => "'{}'" })
  exclusions?: string[];

  // Translation fields (for quick access without joins)
  @Column({ type: 'varchar', length: 255, nullable: true })
  en_name?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  en_short_description?: string;

  @Column({ type: 'text', nullable: true })
  en_detailed_description?: string;

  @Column({ type: 'text', nullable: true })
  en_whats_included?: string;

  @Column({ type: 'text', nullable: true })
  en_whats_excluded?: string;

  @Column({ type: 'text', nullable: true })
  en_daily_itinerary?: string;

  @Column({ type: 'text', array: true, nullable: true, default: () => "'{}'" })
  en_whats_included_items?: string[];

  @Column({ type: 'text', array: true, nullable: true, default: () => "'{}'" })
  en_whats_excluded_items?: string[];

  @Column({ type: 'text', array: true, nullable: true, default: () => "'{}'" })
  en_daily_itinerary_items?: string[];

  @Column({ type: 'jsonb', nullable: true })
  en_daily_itinerary_days?: Array<{
    day_number: number;
    title: string;
    description: string;
    activities: string;
    meals: string;
  }>;

  // Arabic translations
  @Column({ type: 'varchar', length: 255, nullable: true })
  ar_name?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  ar_short_description?: string;

  @Column({ type: 'text', nullable: true })
  ar_detailed_description?: string;

  @Column({ type: 'text', nullable: true })
  ar_whats_included?: string;

  @Column({ type: 'text', nullable: true })
  ar_whats_excluded?: string;

  @Column({ type: 'text', nullable: true })
  ar_daily_itinerary?: string;

  @Column({ type: 'text', array: true, nullable: true, default: () => "'{}'" })
  ar_whats_included_items?: string[];

  @Column({ type: 'text', array: true, nullable: true, default: () => "'{}'" })
  ar_whats_excluded_items?: string[];

  @Column({ type: 'text', array: true, nullable: true, default: () => "'{}'" })
  ar_daily_itinerary_items?: string[];

  @Column({ type: 'jsonb', nullable: true })
  ar_daily_itinerary_days?: Array<{
    day_number: number;
    title: string;
    description: string;
    activities: string;
    meals: string;
  }>;

  // Spanish translations
  @Column({ type: 'varchar', length: 255, nullable: true })
  es_name?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  es_short_description?: string;

  @Column({ type: 'text', nullable: true })
  es_detailed_description?: string;

  @Column({ type: 'text', nullable: true })
  es_whats_included?: string;

  @Column({ type: 'text', nullable: true })
  es_whats_excluded?: string;

  @Column({ type: 'text', nullable: true })
  es_daily_itinerary?: string;

  @Column({ type: 'text', array: true, nullable: true, default: () => "'{}'" })
  es_whats_included_items?: string[];

  @Column({ type: 'text', array: true, nullable: true, default: () => "'{}'" })
  es_whats_excluded_items?: string[];

  @Column({ type: 'text', array: true, nullable: true, default: () => "'{}'" })
  es_daily_itinerary_items?: string[];

  @Column({ type: 'jsonb', nullable: true })
  es_daily_itinerary_days?: Array<{
    day_number: number;
    title: string;
    description: string;
    activities: string;
    meals: string;
  }>;

  // German translations
  @Column({ type: 'varchar', length: 255, nullable: true })
  de_name?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  de_short_description?: string;

  @Column({ type: 'text', nullable: true })
  de_detailed_description?: string;

  @Column({ type: 'text', nullable: true })
  de_whats_included?: string;

  @Column({ type: 'text', nullable: true })
  de_whats_excluded?: string;

  @Column({ type: 'text', nullable: true })
  de_daily_itinerary?: string;

  @Column({ type: 'text', array: true, nullable: true, default: () => "'{}'" })
  de_whats_included_items?: string[];

  @Column({ type: 'text', array: true, nullable: true, default: () => "'{}'" })
  de_whats_excluded_items?: string[];

  @Column({ type: 'text', array: true, nullable: true, default: () => "'{}'" })
  de_daily_itinerary_items?: string[];

  @Column({ type: 'jsonb', nullable: true })
  de_daily_itinerary_days?: Array<{
    day_number: number;
    title: string;
    description: string;
    activities: string;
    meals: string;
  }>;

  // Russian translations
  @Column({ type: 'varchar', length: 255, nullable: true })
  ru_name?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  ru_short_description?: string;

  @Column({ type: 'text', nullable: true })
  ru_detailed_description?: string;

  @Column({ type: 'text', nullable: true })
  ru_whats_included?: string;

  @Column({ type: 'text', nullable: true })
  ru_whats_excluded?: string;

  @Column({ type: 'text', nullable: true })
  ru_daily_itinerary?: string;

  @Column({ type: 'text', array: true, nullable: true, default: () => "'{}'" })
  ru_whats_included_items?: string[];

  @Column({ type: 'text', array: true, nullable: true, default: () => "'{}'" })
  ru_whats_excluded_items?: string[];

  @Column({ type: 'text', array: true, nullable: true, default: () => "'{}'" })
  ru_daily_itinerary_items?: string[];

  @Column({ type: 'jsonb', nullable: true })
  ru_daily_itinerary_days?: Array<{
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

  // Relations
  @ManyToOne(() => Category, category => category.packages, { nullable: true, eager: true })
  @JoinColumn({ name: 'category_id' })
  category?: Category;

  @OneToMany(() => PackageImage, image => image.package, { cascade: true })
  images!: PackageImage[];

  @OneToMany(() => Itinerary, itinerary => itinerary.package, { cascade: true })
  itineraries!: Itinerary[];

  @OneToMany(() => Booking, booking => booking.package)
  bookings!: Booking[];

  @OneToMany(() => Review, review => review.package)
  reviews!: Review[];

  @OneToMany(() => PackageAddon, addon => addon.package, { cascade: true })
  addons!: PackageAddon[];

  @OneToMany(() => PackageTranslation, translation => translation.package, { cascade: true })
  translations!: PackageTranslation[];

  @ManyToMany(() => Category, category => category.packages)
  @JoinTable({
    name: 'package_categories',
    joinColumn: { name: 'package_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories!: Category[];

  toJSON() {
    // Use English translations as fallback for empty language fields
    const en_name_val = this.en_name || this.title;
    const en_short_desc_val = this.en_short_description || this.short_desc;
    const en_long_desc_val = this.en_detailed_description || this.long_desc;
    
    return {
      id: this.id,
      title: this.title,
      destination: this.destination,
      category_id: this.category_id,
      duration_days: this.duration_days,
      base_price: this.base_price,
      short_desc: this.short_desc,
      long_desc: this.long_desc,
      featured: this.featured,
      average_rating: this.average_rating,
      trip_type: this.trip_type,
      booking_count: this.booking_count,
      inclusions: this.inclusions || [],
      exclusions: this.exclusions || [],
      created_at: this.created_at,
      updated_at: this.updated_at,
      images: this.images && this.images.map(img => 
        typeof img.toJSON === 'function' 
          ? img.toJSON() 
          : img
      ),
      itineraries: this.itineraries,
      categories: this.categories,
      category: this.category,
      reviews_count: this.reviews?.length || 0,
      translations: this.translations || [],
      // Translation fields - with fallbacks to English or title/desc
      en_name: en_name_val,
      en_short_description: en_short_desc_val,
      en_detailed_description: en_long_desc_val,
      en_whats_included: this.en_whats_included || '',
      en_whats_excluded: this.en_whats_excluded || '',
      en_daily_itinerary: this.en_daily_itinerary || '',
      en_whats_included_items: this.en_whats_included_items || [],
      en_whats_excluded_items: this.en_whats_excluded_items || [],
      ar_name: this.ar_name || en_name_val,
      ar_short_description: this.ar_short_description || en_short_desc_val,
      ar_detailed_description: this.ar_detailed_description || en_long_desc_val,
      ar_whats_included: this.ar_whats_included || this.en_whats_included || '',
      ar_whats_excluded: this.ar_whats_excluded || this.en_whats_excluded || '',
      ar_daily_itinerary: this.ar_daily_itinerary || this.en_daily_itinerary || '',
      ar_whats_included_items: this.ar_whats_included_items || this.en_whats_included_items || [],
      ar_whats_excluded_items: this.ar_whats_excluded_items || this.en_whats_excluded_items || [],
      es_name: this.es_name || en_name_val,
      es_short_description: this.es_short_description || en_short_desc_val,
      es_detailed_description: this.es_detailed_description || en_long_desc_val,
      es_whats_included: this.es_whats_included || this.en_whats_included || '',
      es_whats_excluded: this.es_whats_excluded || this.en_whats_excluded || '',
      es_daily_itinerary: this.es_daily_itinerary || this.en_daily_itinerary || '',
      es_whats_included_items: this.es_whats_included_items || this.en_whats_included_items || [],
      es_whats_excluded_items: this.es_whats_excluded_items || this.en_whats_excluded_items || [],
      de_name: this.de_name || en_name_val,
      de_short_description: this.de_short_description || en_short_desc_val,
      de_detailed_description: this.de_detailed_description || en_long_desc_val,
      de_whats_included: this.de_whats_included || this.en_whats_included || '',
      de_whats_excluded: this.de_whats_excluded || this.en_whats_excluded || '',
      de_daily_itinerary: this.de_daily_itinerary || this.en_daily_itinerary || '',
      de_whats_included_items: this.de_whats_included_items || this.en_whats_included_items || [],
      de_whats_excluded_items: this.de_whats_excluded_items || this.en_whats_excluded_items || [],
      ru_name: this.ru_name || en_name_val,
      ru_short_description: this.ru_short_description || en_short_desc_val,
      ru_detailed_description: this.ru_detailed_description || en_long_desc_val,
      ru_whats_included: this.ru_whats_included || this.en_whats_included || '',
      ru_whats_excluded: this.ru_whats_excluded || this.en_whats_excluded || '',
      ru_daily_itinerary: this.ru_daily_itinerary || this.en_daily_itinerary || '',
      ru_whats_included_items: this.ru_whats_included_items || this.en_whats_included_items || [],
      ru_whats_excluded_items: this.ru_whats_excluded_items || this.en_whats_excluded_items || [],
    };
  }
}
