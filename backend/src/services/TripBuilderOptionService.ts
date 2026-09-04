/// <reference types="express" />
import { Repository } from 'typeorm';
import { TripBuilderOption } from '../entities/TripBuilderOption.js';
import { TripBuilderOptionRepository } from '../repositories/TripBuilderOptionRepository.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

export class TripBuilderOptionService {
  private repo: TripBuilderOptionRepository;

  constructor(repository: Repository<TripBuilderOption>) {
    this.repo = new TripBuilderOptionRepository(repository);
  }

  async getActive(destination?: string, itemType?: string) {
    return await this.repo.findActive(destination, itemType);
  }

  async getDestinations() {
    return await this.repo.getDistinctDestinations();
  }

  async getAllAdmin(limit = 100, offset = 0) {
    return await this.repo.findAllPaginated(limit, offset);
  }

  async getById(id: string) {
    const option = await this.repo.findById(id);
    if (!option) throw new NotFoundError('Trip builder option not found');
    return option;
  }

  async create(data: Partial<TripBuilderOption>) {
    if (!data.name || !data.destination || !data.item_type) {
      throw new ValidationError('Name, destination and item_type are required');
    }
    if (data.price === undefined || data.price === null || Number(data.price) < 0) {
      throw new ValidationError('A valid price is required');
    }
    return await this.repo.create(data);
  }

  async update(id: string, data: Partial<TripBuilderOption>) {
    await this.getById(id);
    const updated = await this.repo.update(id, data);
    return updated!;
  }

  async delete(id: string) {
    await this.getById(id);
    await this.repo.delete(id);
  }
}
