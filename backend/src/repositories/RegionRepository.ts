import { Repository, DataSource } from 'typeorm';
import { Region } from '../entities/Region.js';
import { RegionDestination } from '../entities/RegionDestination.js';
import { BaseRepository } from './BaseRepository.js';

export class RegionRepository extends BaseRepository<Region> {
  private destinationRepository: Repository<RegionDestination>;

  constructor(repository: Repository<Region>, dataSource: DataSource) {
    super(repository);
    this.destinationRepository = dataSource.getRepository(RegionDestination);
  }

  /**
   * جلب كل الـ regions مع الوجهات بتاعتها، مرتبة حسب sort_order
   * (للعرض في الصفحة الرئيسية - active فقط)
   */
  async findAllActiveWithDestinations(): Promise<Region[]> {
    const regions = await this.repository.find({
      where: { is_active: true },
      relations: ['destinations'],
      order: { sort_order: 'ASC', created_at: 'ASC' },
    });

    // Sort destinations within each region
    regions.forEach((region) => {
      if (region.destinations) {
        region.destinations.sort((a, b) => a.sort_order - b.sort_order);
      }
    });

    return regions;
  }

  /**
   * جلب كل الـ regions (active + inactive) مع الوجهات - للأدمن
   */
  async findAllWithDestinations(): Promise<Region[]> {
    const regions = await this.repository.find({
      relations: ['destinations'],
      order: { sort_order: 'ASC', created_at: 'ASC' },
    });

    regions.forEach((region) => {
      if (region.destinations) {
        region.destinations.sort((a, b) => a.sort_order - b.sort_order);
      }
    });

    return regions;
  }

  async findById(id: string): Promise<Region | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['destinations'],
    });
  }

  async findBySlug(slug: string): Promise<Region | null> {
    return await this.repository.findOne({ where: { slug } });
  }

  async createRegion(data: {
    name: string;
    slug: string;
    image?: string;
    is_active?: boolean;
    sort_order?: number;
  }): Promise<Region> {
    const region = this.repository.create(data);
    return await this.repository.save(region);
  }

  async updateRegion(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      image: string;
      is_active: boolean;
      sort_order: number;
    }>
  ): Promise<Region> {
    await this.repository.update(id, data);
    return (await this.findById(id))!;
  }

  async deleteRegion(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  /**
   * استبدال قائمة الوجهات بالكامل لمنطقة معينة (بدل تحديث واحدة واحدة)
   */
  async replaceDestinations(regionId: string, names: string[]): Promise<RegionDestination[]> {
    await this.destinationRepository.delete({ region_id: regionId });

    if (names.length === 0) return [];

    const destinations = names.map((name, index) =>
      this.destinationRepository.create({
        region_id: regionId,
        name,
        sort_order: index,
      })
    );

    return await this.destinationRepository.save(destinations);
  }
}
