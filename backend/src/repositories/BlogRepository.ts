import { Repository, SelectQueryBuilder } from 'typeorm';
import { BlogPost } from '../entities/BlogPost.js';
import { BaseRepository } from './BaseRepository.js';

export interface BlogListFilters {
  published?: boolean;
  categoryId?: string;
  search?: string;
  tag?: string;
}

export class BlogRepository extends BaseRepository<BlogPost> {
  constructor(repository: Repository<BlogPost>) {
    super(repository);
  }

  private baseQuery(): SelectQueryBuilder<BlogPost> {
    return this.repository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.author', 'author');
  }

  private applyFilters(qb: SelectQueryBuilder<BlogPost>, filters: BlogListFilters) {
    if (filters.published !== undefined) {
      qb.andWhere('post.published = :published', { published: filters.published });
    }
    if (filters.categoryId) {
      qb.andWhere('post.category_id = :categoryId', { categoryId: filters.categoryId });
    }
    if (filters.tag) {
      qb.andWhere(':tag = ANY(post.tags)', { tag: filters.tag });
    }
    if (filters.search) {
      qb.andWhere(
        '(post.title ILIKE :q OR post.excerpt ILIKE :q OR post.body ILIKE :q)',
        { q: `%${filters.search}%` }
      );
    }
    return qb;
  }

  async findPaginated(
    filters: BlogListFilters,
    limit: number,
    offset: number
  ): Promise<{ posts: BlogPost[]; total: number }> {
    const qb = this.applyFilters(this.baseQuery(), filters)
      .orderBy('post.published_at', 'DESC')
      .addOrderBy('post.created_at', 'DESC')
      .take(limit)
      .skip(offset);

    const [posts, total] = await qb.getManyAndCount();
    return { posts, total };
  }

  async findBySlug(slug: string, publishedOnly = true): Promise<BlogPost | null> {
    const qb = this.baseQuery().where('post.slug = :slug', { slug });
    if (publishedOnly) {
      qb.andWhere('post.published = true');
    }
    return await qb.getOne();
  }

  async findById(id: string): Promise<BlogPost | null> {
    return await this.baseQuery().where('post.id = :id', { id }).getOne();
  }

  async findRelated(categoryId: string | undefined, excludeId: string, limit: number): Promise<BlogPost[]> {
    const qb = this.baseQuery()
      .where('post.published = true')
      .andWhere('post.id != :excludeId', { excludeId })
      .orderBy('post.published_at', 'DESC')
      .take(limit);

    if (categoryId) {
      qb.andWhere('post.category_id = :categoryId', { categoryId });
    }
    return await qb.getMany();
  }

  async incrementViews(id: string): Promise<void> {
    await this.repository.increment({ id }, 'views_count', 1);
  }
}
