import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('system_settings')
export class SystemSettings {
  @PrimaryColumn('varchar', { length: 255 })
  key: string;

  @Column('text', { nullable: true })
  value: string | null;

  @Column('varchar', { length: 50, default: 'string' })
  type: 'string' | 'number' | 'boolean' | 'json';

  @Column('text', { nullable: true })
  description: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Helper methods
  getValue<T>(): T {
    if (!this.value) return null as any;

    switch (this.type) {
      case 'boolean':
        return (this.value === 'true' || this.value === '1') as any;
      case 'number':
        return parseInt(this.value, 10) as any;
      case 'json':
        return JSON.parse(this.value);
      default:
        return this.value as any;
    }
  }

  setValue(value: any): void {
    if (value === null || value === undefined) {
      this.value = null;
      return;
    }

    switch (this.type) {
      case 'boolean':
        this.value = (value === true || value === 'true' || value === '1') ? 'true' : 'false';
        break;
      case 'number':
        this.value = String(Number(value));
        break;
      case 'json':
        this.value = typeof value === 'string' ? value : JSON.stringify(value);
        break;
      default:
        this.value = String(value);
    }
  }
}
