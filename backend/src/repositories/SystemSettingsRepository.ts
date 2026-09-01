import { Repository } from 'typeorm';
import { SystemSettings } from '../entities/SystemSettings';
import { AppDataSource } from '../config/connection';

export class SystemSettingsRepository {
  private repository: Repository<SystemSettings>;

  constructor() {
    this.repository = AppDataSource.getRepository(SystemSettings);
  }

  /**
   * Get setting by key
   */
  async getSetting(key: string): Promise<SystemSettings | null> {
    return this.repository.findOne({ where: { key } });
  }

  /**
   * Get all settings
   */
  async getAllSettings(): Promise<SystemSettings[]> {
    return this.repository.find({
      order: { created_at: 'DESC' } as any,
    });
  }

  /**
   * Get settings by keys
   */
  async getSettingsByKeys(keys: string[]): Promise<SystemSettings[]> {
    return this.repository.find({
      where: keys.map(key => ({ key })),
    });
  }

  /**
   * Update setting
   */
  async updateSetting(key: string, value: any, type: 'string' | 'number' | 'boolean' | 'json' = 'string'): Promise<SystemSettings> {
    let setting = await this.repository.findOne({ where: { key } });

    if (!setting) {
      setting = this.repository.create({ key, type });
    }

    setting.type = type;
    setting.setValue(value);

    return this.repository.save(setting);
  }

  /**
   * Update multiple settings
   */
  async updateSettings(updates: { key: string; value: any; type?: string }[]): Promise<SystemSettings[]> {
    const results: SystemSettings[] = [];

    for (const update of updates) {
      const setting = await this.updateSetting(
        update.key,
        update.value,
        (update.type || 'string') as any
      );
      results.push(setting);
    }

    return results;
  }

  /**
   * Delete setting
   */
  async deleteSetting(key: string): Promise<boolean> {
    const result = await this.repository.delete({ key });
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * Get setting value directly
   */
  async getSettingValue<T>(key: string, defaultValue?: T): Promise<T | null> {
    const setting = await this.repository.findOne({ where: { key } });
    if (!setting) return defaultValue || null;
    return setting.getValue<T>();
  }

  /**
   * Set setting value
   */
  async setSettingValue(key: string, value: any, type: string = 'string'): Promise<void> {
    await this.updateSetting(key, value, type as any);
  }
}
