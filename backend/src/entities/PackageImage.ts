import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Package } from './Package.js';

@Entity('package_images')
export class PackageImage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  package_id!: string;

  @Column({ type: 'varchar', length: 500 })
  url!: string;

  @Column({ type: 'bytea', nullable: true })
  image_data?: Buffer;

  @Column({ type: 'varchar', length: 255, nullable: true })
  alt_text?: string;

  @Column({ type: 'integer', default: 0 })
  order!: number;

  @CreateDateColumn()
  created_at!: Date;

  // Relations
  @ManyToOne(() => Package, pkg => pkg.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'package_id' })
  package!: Package;

  /**
   * تحويل البيانات عند التسلسل إلى JSON
   * يحول Buffer إلى Base64 string
   */
  toJSON() {
    return {
      id: this.id,
      package_id: this.package_id,
      url: this.url,
      image_data: this.image_data 
        ? Buffer.isBuffer(this.image_data)
          ? this.image_data.toString('base64')
          : (typeof this.image_data === 'string' 
              ? this.image_data 
              : JSON.stringify(this.image_data))
        : null,
      alt_text: this.alt_text,
      order: this.order,
      created_at: this.created_at,
    };
  }
}
