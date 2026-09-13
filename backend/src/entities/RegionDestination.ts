import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { Region } from './Region.js';

@Entity('region_destinations')
export class RegionDestination {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  region_id!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'integer', default: 0 })
  sort_order!: number;

  // Months (1 = January ... 12 = December) the admin has marked as the best
  // time to visit this destination. Shown as "Best time to visit" on the
  // Destinations megamenu and on package detail pages.
  @Column({ type: 'int', array: true, default: () => "'{}'" })
  best_months!: number[];

  @CreateDateColumn()
  created_at!: Date;

  // Relations
  @ManyToOne('Region', (region: Region) => region.destinations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'region_id' })
  region!: Region;
}
