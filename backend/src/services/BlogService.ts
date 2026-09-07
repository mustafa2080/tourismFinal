import { AppDataSource } from '../config/connection.js';
import { BlogPost } from '../entities/BlogPost.js';
import { BlogCategory } from '../entities/BlogCategory.js';
import { BlogRepository, BlogListFilters } from '../repositories/BlogRepository.js';
import { BlogCategoryRepository } from '../repositories/BlogCategoryRepository.js';
import { ValidationError, AppError, NotFoundError } from '../utils/errors.js';

const WORDS_PER_MINUTE = 200;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function estimateReadTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export interface CreatePostInput {
  title: string;
  body: string;
  slug?: string;
  excerpt?: string;
  featured_image?: string;
  category_id?: string;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  published?: boolean;
}

export type UpdatePostInput = Partial<CreatePostInput>;

export class BlogService {
  private blogRepository: BlogRepository;
  private categoryRepository: BlogCategoryRepository;

  constructor() {
    this.blogRepository = new BlogRepository(AppDataSource.getRepository(BlogPost));
    this.categoryRepository = new BlogCategoryRepository(AppDataSource.getRepository(BlogCategory));
  }

  // ---------- Public reads ----------

  async getAllPosts(
    limit: number,
    offset: number,
    filters: { categoryId?: string; search?: string; tag?: string } = {}
  ): Promise<{ posts: BlogPost[]; total: number }> {
    return await this.blogRepository.findPaginated(
      { published: true, ...filters },
      limit,
      offset
    );
  }

  async getPostBySlug(slug: string): Promise<BlogPost> {
    if (!slug) throw new ValidationError('Slug is required');
    const post = await this.blogRepository.findBySlug(slug, true);
    if (!post) throw new NotFoundError('Post not found');
    // Fire-and-forget view increment; do not block the response on it
    this.blogRepository.incrementViews(post.id).catch(() => {});
    return post;
  }

  async getRecentPosts(limit: number): Promise<BlogPost[]> {
    const { posts } = await this.blogRepository.findPaginated({ published: true }, limit, 0);
    return posts;
  }

  async searchPosts(query: string, limit: number): Promise<BlogPost[]> {
    if (!query) throw new ValidationError('Search query is required');
    const { posts } = await this.blogRepository.findPaginated(
      { published: true, search: query },
      limit,
      0
    );
    return posts;
  }

  async getRelatedPosts(postId: string, limit = 3): Promise<BlogPost[]> {
    const post = await this.blogRepository.findById(postId);
    if (!post) return [];
    return await this.blogRepository.findRelated(post.category_id, postId, limit);
  }

  // ---------- Categories ----------

  async getCategories(): Promise<BlogCategory[]> {
    return await this.categoryRepository.findAllOrdered();
  }

  async createCategory(name: string, description?: string): Promise<BlogCategory> {
    if (!name) throw new ValidationError('Category name is required');
    const slug = slugify(name);
    const existing = await this.categoryRepository.findBySlug(slug);
    if (existing) throw new AppError(400, 'A category with this name already exists');

    const category = this.categoryRepository.repository.create({ name, slug, description });
    return await this.categoryRepository.repository.save(category);
  }

  async updateCategory(id: string, updates: { name?: string; description?: string }): Promise<BlogCategory> {
    const category = await this.categoryRepository.repository.findOne({ where: { id } });
    if (!category) throw new NotFoundError('Category not found');

    if (updates.name && updates.name !== category.name) {
      const newSlug = slugify(updates.name);
      const existing = await this.categoryRepository.findBySlug(newSlug);
      if (existing && existing.id !== id) {
        throw new AppError(400, 'A category with this name already exists');
      }
      category.name = updates.name;
      category.slug = newSlug;
    }
    if (updates.description !== undefined) category.description = updates.description;

    return await this.categoryRepository.repository.save(category);
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.categoryRepository.repository.findOne({ where: { id } });
    if (!category) throw new NotFoundError('Category not found');
    await this.categoryRepository.repository.remove(category);
  }

  // ---------- Admin writes ----------

  async createPost(input: CreatePostInput, authorId: string): Promise<BlogPost> {
    if (!input.title || !input.body) {
      throw new ValidationError('Title and body are required');
    }

    const slug = slugify(input.slug || input.title);
    const existing = await this.blogRepository.findBySlug(slug, false);
    if (existing) throw new AppError(400, 'A post with this slug already exists');

    const published = !!input.published;
    const post = this.blogRepository.repository.create({
      title: input.title,
      slug,
      body: input.body,
      excerpt: input.excerpt || input.body.substring(0, 200),
      featured_image: input.featured_image,
      category_id: input.category_id || undefined,
      tags: input.tags || [],
      meta_title: input.meta_title,
      meta_description: input.meta_description,
      author_id: authorId,
      published,
      published_at: published ? new Date() : undefined,
      read_time_minutes: estimateReadTime(input.body),
    });

    const saved = await this.blogRepository.repository.save(post);
    return (await this.blogRepository.findById(saved.id)) as BlogPost;
  }

  async updatePost(postId: string, updates: UpdatePostInput): Promise<BlogPost> {
    if (!postId) throw new ValidationError('Post ID is required');

    const post = await this.blogRepository.repository.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundError('Post not found');

    if (updates.slug || updates.title) {
      const newSlug = slugify(updates.slug || updates.title || post.slug);
      if (newSlug !== post.slug) {
        const existing = await this.blogRepository.findBySlug(newSlug, false);
        if (existing && existing.id !== postId) {
          throw new AppError(400, 'A post with this slug already exists');
        }
        post.slug = newSlug;
      }
    }

    if (updates.title !== undefined) post.title = updates.title;
    if (updates.body !== undefined) {
      post.body = updates.body;
      post.read_time_minutes = estimateReadTime(updates.body);
    }
    if (updates.excerpt !== undefined) post.excerpt = updates.excerpt;
    if (updates.featured_image !== undefined) post.featured_image = updates.featured_image;
    if (updates.category_id !== undefined) post.category_id = updates.category_id || undefined;
    if (updates.tags !== undefined) post.tags = updates.tags;
    if (updates.meta_title !== undefined) post.meta_title = updates.meta_title;
    if (updates.meta_description !== undefined) post.meta_description = updates.meta_description;

    if (updates.published !== undefined && updates.published !== post.published) {
      post.published = updates.published;
      post.published_at = updates.published ? new Date() : post.published_at;
    }

    await this.blogRepository.repository.save(post);
    return (await this.blogRepository.findById(postId)) as BlogPost;
  }

  async deletePost(postId: string): Promise<void> {
    if (!postId) throw new ValidationError('Post ID is required');
    const post = await this.blogRepository.repository.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundError('Post not found');
    await this.blogRepository.repository.remove(post);
  }

  async setPublished(postId: string, published: boolean): Promise<BlogPost> {
    if (!postId) throw new ValidationError('Post ID is required');
    const post = await this.blogRepository.repository.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundError('Post not found');

    post.published = published;
    post.published_at = published ? (post.published_at || new Date()) : post.published_at;
    await this.blogRepository.repository.save(post);
    return (await this.blogRepository.findById(postId)) as BlogPost;
  }

  async getPostByIdForAdmin(postId: string): Promise<BlogPost> {
    const post = await this.blogRepository.findById(postId);
    if (!post) throw new NotFoundError('Post not found');
    return post;
  }

  async getAllPostsForAdmin(
    limit: number,
    offset: number,
    filters: { categoryId?: string; search?: string; published?: boolean } = {}
  ): Promise<{ posts: BlogPost[]; total: number }> {
    return await this.blogRepository.findPaginated(filters, limit, offset);
  }

  async getStats(): Promise<{ totalPosts: number; published: number; draft: number; totalViews: number }> {
    const repo = this.blogRepository.repository;
    const [totalPosts, published] = await Promise.all([
      repo.count(),
      repo.count({ where: { published: true } }),
    ]);
    const { sum } = await repo
      .createQueryBuilder('post')
      .select('COALESCE(SUM(post.views_count), 0)', 'sum')
      .getRawOne();

    return {
      totalPosts,
      published,
      draft: totalPosts - published,
      totalViews: parseInt(sum, 10) || 0,
    };
  }
}
