import { Repository } from 'typeorm';
import { PackageAddonTranslation } from '../entities/PackageAddonTranslation.js';

export class PackageAddonTranslationRepository {
  constructor(private repository: Repository<PackageAddonTranslation>) {}

  async create(data: Partial<PackageAddonTranslation>): Promise<PackageAddonTranslation> {
    const translation = this.repository.create(data);
    return await this.repository.save(translation);
  }

  async findByAddonAndLanguage(
    addonId: string,
    language: string
  ): Promise<PackageAddonTranslation | null> {
    return await this.repository.findOne({
      where: { addon_id: addonId, language },
    });
  }

  async findByAddon(addonId: string): Promise<PackageAddonTranslation[]> {
    return await this.repository.find({
      where: { addon_id: addonId },
    });
  }

  async update(
    id: string,
    data: Partial<PackageAddonTranslation>
  ): Promise<PackageAddonTranslation> {
    await this.repository.update(id, data);
    return (await this.repository.findOne({ where: { id } })) as PackageAddonTranslation;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByAddon(addonId: string): Promise<void> {
    await this.repository.delete({ addon_id: addonId });
  }

  async upsert(
    addonId: string,
    language: string,
    data: Partial<PackageAddonTranslation>
  ): Promise<PackageAddonTranslation> {
    const existing = await this.findByAddonAndLanguage(addonId, language);
    
    if (existing) {
      return await this.update(existing.id, { ...data, addon_id: addonId, language });
    }
    
    return await this.create({ ...data, addon_id: addonId, language });
  }
}
