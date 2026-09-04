/// <reference types="express" />
import { Repository } from 'typeorm';
import { CustomTripRequest } from '../entities/CustomTripRequest.js';
import { BaseRepository } from './BaseRepository.js';

export class CustomTripRequestRepository extends BaseRepository<CustomTripRequest> {
  constructor(repository: Repository<CustomTripRequest>) {
    super(repository);
  }

  async findByIdWithItems(id: string): Promise<CustomTripRequest | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['items', 'user'],
    });
  }

  async findAllPaginated(
    limit: number = 20,
    offset: number = 0,
    status?: string
  ): Promise<{ requests: CustomTripRequest[]; total: number }> {
    const where = status && status !== 'all' ? { status: status as any } : {};
    const [requests, total] = await this.repository.findAndCount({
      where,
      relations: ['items', 'user'],
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { requests, total };
  }

  async findByUser(userId: string, limit: number = 20, offset: number = 0) {
    const [requests, total] = await this.repository.findAndCount({
      where: { user_id: userId },
      relations: ['items'],
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { requests, total };
  }

  async countByStatus(status: string): Promise<number> {
    return await this.repository.count({ where: { status: status as any } });
  }

  async getStats(): Promise<Record<string, number>> {
    const statuses = ['submitted', 'reviewing', 'quoted', 'accepted', 'rejected', 'converted', 'cancelled'];
    const result: Record<string, number> = { total: 0 };
    for (const status of statuses) {
      result[status] = await this.countByStatus(status);
      result.total += result[status];
    }
    return result;
  }
}
