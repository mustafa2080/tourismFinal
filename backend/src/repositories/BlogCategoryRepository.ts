import { Repository } from 'typeorm';
import { BlogCategory } from '../entities/BlogCategory.js';
import { BaseRepository } from './BaseRepository.js';

export class BlogCategoryRepository extends BaseRepository<BlogCategory> {
  constructor(repository: Repository<BlogCategory>) {
    super(repository);
  }

  async findBySlug(slug: string): Promise<BlogCategory | null> {
    return await this.repository.findOne({ where: { slug } });
  }

  async findAllOrdered(): Promise<BlogCategory[]> {
    return await this.repository.find({ order: { name: 'ASC' } });
  }
}
