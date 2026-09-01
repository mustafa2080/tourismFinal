import { BaseRepository } from './BaseRepository.js';
import { PackageAddon } from '../entities/PackageAddon.js';
import { AppDataSource } from '../config/connection.js';

export class PackageAddonRepository extends BaseRepository<PackageAddon> {
  constructor() {
    super(AppDataSource.getRepository(PackageAddon));
  }

  /**
   * Find all addons for a package with filters
   */
  async findByPackageId(packageId: string, onlyAvailable: boolean = true) {
    const query = this.repository.createQueryBuilder('addon')
      .where('addon.package_id = :packageId', { packageId });

    if (onlyAvailable) {
      query.andWhere('addon.is_available = :available', { available: true });
    }

    return query.orderBy('addon.sort_order', 'ASC')
      .addOrderBy('addon.created_at', 'DESC')
      .getMany();
  }

  /**
   * Find addons by category
   */
  async findByCategory(packageId: string, category: string) {
    return this.repository.find({
      where: { package_id: packageId, category },
      order: { sort_order: 'ASC' },
    });
  }

  /**
   * Get addon statistics
   */
  async getStatistics(packageId: string) {
    const addons = await this.repository.find({
      where: { package_id: packageId },
    });

    return {
      total: addons.length,
      available: addons.filter(a => a.is_available).length,
      byCategory: addons.reduce((acc, addon) => {
        acc[addon.category] = (acc[addon.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
