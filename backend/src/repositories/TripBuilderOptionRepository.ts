/// <reference types="express" />
import { Repository } from 'typeorm';
import { TripBuilderOption } from '../entities/TripBuilderOption.js';
import { BaseRepository } from './BaseRepository.js';

export class TripBuilderOptionRepository extends BaseRepository<TripBuilderOption> {
  constructor(repository: Repository<TripBuilderOption>) {
    super(repository);
  }

  async findActive(destination?: string, itemType?: string): Promise<TripBuilderOption[]> {
    const where: any = { is_active: true };
    if (destination) where.destination = destination;
    if (itemType) where.item_type = itemType;

    return await this.repository.find({
      where,
      order: { sort_order: 'ASC', created_at: 'DESC' },
    });
  }

  async findAllPaginated(limit: number = 50, offset: number = 0) {
    const [options, total] = await this.repository.findAndCount({
      order: { destination: 'ASC', item_type: 'ASC', sort_order: 'ASC' },
      take: limit,
      skip: offset,
    });
    return { options, total };
  }

  async getDistinctDestinations(): Promise<string[]> {
    const rows = await this.repository
      .createQueryBuilder('opt')
      .select('DISTINCT opt.destination', 'destination')
      .where('opt.is_active = true')
      .orderBy('opt.destination', 'ASC')
      .getRawMany();
    return rows.map(r => r.destination);
  }
}
