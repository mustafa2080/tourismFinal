import { Repository } from 'typeorm';
import { PackageTranslation } from '../entities/PackageTranslation.js';

/**
 * Package Translation Repository
 * Handles all database operations for package translations
 */
export class PackageTranslationRepository {
  constructor(private repository: Repository<PackageTranslation>) {}

  /**
   * Find translation by package ID and language
   */
  async findByPackageAndLanguage(
    packageId: string,
    language: string
  ): Promise<PackageTranslation | null> {
    return this.repository.findOne({
      where: {
        package_id: packageId,
        language
      }
    });
  }

  /**
   * Find all translations for a package
   */
  async findByPackageId(packageId: string): Promise<PackageTranslation[]> {
    return this.repository.find({
      where: { package_id: packageId },
      order: { language: 'ASC' }
    });
  }

  /**
   * Find all translations for multiple packages
   */
  async findByPackageIds(packageIds: string[]): Promise<PackageTranslation[]> {
    if (packageIds.length === 0) return [];

    return this.repository
      .createQueryBuilder('pt')
      .where('pt.package_id IN (:...packageIds)', { packageIds })
      .orderBy('pt.package_id', 'ASC')
      .addOrderBy('pt.language', 'ASC')
      .getMany();
  }

  /**
   * Create translation
   */
  async create(translation: Partial<PackageTranslation>): Promise<PackageTranslation> {
    const newTranslation = this.repository.create(translation);
    return this.repository.save(newTranslation);
  }

  /**
   * Create multiple translations
   */
  async createMultiple(translations: Partial<PackageTranslation>[]): Promise<PackageTranslation[]> {
    const newTranslations = this.repository.create(translations);
    return this.repository.save(newTranslations);
  }

  /**
   * Update translation
   */
  async update(id: string, translation: Partial<PackageTranslation>): Promise<PackageTranslation | null> {
    await this.repository.update(id, translation);
    return this.repository.findOne({ where: { id } });
  }

  /**
   * Delete translation
   */
  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  /**
   * Delete all translations for a package
   */
  async deleteByPackageId(packageId: string): Promise<void> {
    await this.repository.delete({ package_id: packageId });
  }

  /**
   * Delete all translations for multiple packages
   */
  async deleteByPackageIds(packageIds: string[]): Promise<void> {
    if (packageIds.length === 0) return;

    await this.repository
      .createQueryBuilder()
      .delete()
      .where('package_id IN (:...packageIds)', { packageIds })
      .execute();
  }

  /**
   * Check if translation exists
   */
  async exists(packageId: string, language: string): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        package_id: packageId,
        language
      }
    });
    return count > 0;
  }

  /**
   * Get translation count for a package
   */
  async countByPackageId(packageId: string): Promise<number> {
    return this.repository.count({
      where: { package_id: packageId }
    });
  }

  /**
   * Get all available languages for a package
   */
  async getLanguagesByPackageId(packageId: string): Promise<string[]> {
    const result = await this.repository
      .createQueryBuilder('pt')
      .select('DISTINCT pt.language', 'language')
      .where('pt.package_id = :packageId', { packageId })
      .orderBy('pt.language', 'ASC')
      .getRawMany();

    return result.map(r => r.language);
  }

  /**
   * Search translations
   */
  async search(query: string, language?: string, limit: number = 50, offset: number = 0): Promise<PackageTranslation[]> {
    let qb = this.repository.createQueryBuilder('pt')
      .where('pt.title ILIKE :query OR pt.destination ILIKE :query OR pt.short_desc ILIKE :query', { query: `%${query}%` });

    if (language) {
      qb = qb.andWhere('pt.language = :language', { language });
    }

    return qb
      .orderBy('pt.created_at', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();
  }

  /**
   * Get raw repository (for direct access if needed)
   */
  getRepository(): Repository<PackageTranslation> {
    return this.repository;
  }
}
