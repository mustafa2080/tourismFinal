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

  @CreateDateColumn()
  created_at!: Date;

  // Relations
  @ManyToOne('Region', (region: Region) => region.destinations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'region_id' })
  region!: Region;
}
