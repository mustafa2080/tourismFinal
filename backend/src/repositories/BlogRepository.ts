import { Repository } from 'typeorm';
import { BlogPost } from '../entities/BlogPost.js';
import { BaseRepository } from './BaseRepository.js';

export class BlogRepository extends BaseRepository<BlogPost> {
  constructor(repository: Repository<BlogPost>) {
    super(repository);
  }

  async findPublished(): Promise<BlogPost[]> {
    return await this.repository.find({
      where: { published: true },
      order: { created_at: 'DESC' },
      relations: ['author'],
    });
  }

  async findBySlug(slug: string): Promise<BlogPost | null> {
    return await this.repository.findOne({
      where: { slug },
      relations: ['author'],
    });
  }

  async findDrafts(): Promise<BlogPost[]> {
    return await this.repository.find({
      where: { published: false },
      order: { created_at: 'DESC' },
    });
  }

  async findByAuthor(authorId: string): Promise<BlogPost[]> {
    return await this.repository.find({
      where: { author_id: authorId },
      order: { created_at: 'DESC' },
    });
  }

  async search(query: string): Promise<BlogPost[]> {
    return await this.repository
      .createQueryBuilder('post')
      .where('post.title ILIKE :query', { query: `%${query}%` })
      .orWhere('post.body ILIKE :query', { query: `%${query}%` })
      .andWhere('post.published = true')
      .orderBy('post.created_at', 'DESC')
      .getMany();
  }
}
