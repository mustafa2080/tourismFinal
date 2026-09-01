import { AppDataSource } from '../config/connection.js';
import { BlogPost } from '../entities/BlogPost.js';
import { BlogRepository } from '../repositories/BlogRepository.js';
import { ValidationError, AppError } from '../utils/errors.js';

export class BlogService {
  private blogRepository: BlogRepository;

  constructor() {
    const typeormRepo = AppDataSource.getRepository(BlogPost);
    this.blogRepository = new BlogRepository(typeormRepo);
  }

  /**
   * Get all published posts (paginated)
   */
  async getAllPosts(limit: number = 10, offset: number = 0): Promise<{
    posts: BlogPost[];
    total: number;
  }> {
    const posts = await this.blogRepository.repository.find({
      where: { published: true },
      relations: ['author'],
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });

    const total = await this.blogRepository.repository.count({
      where: { published: true },
    });

    return { posts, total };
  }

  /**
   * Get post by slug
   */
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    if (!slug) {
      throw new ValidationError('Slug is required');
    }

    return await this.blogRepository.repository.findOne({
      where: { slug, published: true },
      relations: ['author'],
    });
  }

  /**
   * Get post by ID
   */
  async getPostById(id: string): Promise<BlogPost | null> {
    if (!id) {
      throw new ValidationError('Post ID is required');
    }

    return await this.blogRepository.repository.findOne({
      where: { id },
      relations: ['author'],
    });
  }

  /**
   * Create new blog post
   */
  async createPost(
    title: string,
    body: string,
    slug: string,
    authorId: string,
    excerpt?: string
  ): Promise<BlogPost> {
    if (!title || !body || !slug || !authorId) {
      throw new ValidationError('Title, body, slug, and authorId are required');
    }

    // Check if slug already exists
    const existing = await this.blogRepository.repository.findOne({
      where: { slug },
    });

    if (existing) {
      throw new AppError(400, 'A post with this slug already exists');
    }

    const post = this.blogRepository.repository.create({
      title,
      body,
      slug: slug.toLowerCase().replace(/\s+/g, '-'),
      author_id: authorId,
      excerpt: excerpt || body.substring(0, 200),
      published: false,
      created_at: new Date(),
    });

    return await this.blogRepository.repository.save(post);
  }

  /**
   * Update blog post
   */
  async updatePost(
    postId: string,
    updates: Partial<BlogPost>
  ): Promise<BlogPost> {
    if (!postId) {
      throw new ValidationError('Post ID is required');
    }

    const post = await this.blogRepository.repository.findOne({
      where: { id: postId }
    });
    if (!post) {
      throw new AppError(404, 'Post not found');
    }

    // If slug is being updated, check for duplicates
    if (updates.slug && updates.slug !== post.slug) {
      const existing = await this.blogRepository.repository.findOne({
        where: { slug: updates.slug },
      });

      if (existing) {
        throw new AppError(400, 'A post with this slug already exists');
      }

      updates.slug = updates.slug.toLowerCase().replace(/\s+/g, '-');
    }

    Object.assign(post, updates);
    return await this.blogRepository.repository.save(post);
  }

  /**
   * Delete blog post
   */
  async deletePost(postId: string): Promise<void> {
    if (!postId) {
      throw new ValidationError('Post ID is required');
    }

    const post = await this.blogRepository.repository.findOne({
      where: { id: postId }
    });
    if (!post) {
      throw new AppError(404, 'Post not found');
    }

    await this.blogRepository.repository.remove(post);
  }

  /**
   * Publish post
   */
  async publishPost(postId: string): Promise<BlogPost> {
    if (!postId) {
      throw new ValidationError('Post ID is required');
    }

    const post = await this.blogRepository.repository.findOne({
      where: { id: postId }
    });
    if (!post) {
      throw new AppError(404, 'Post not found');
    }

    post.published = true;
    return await this.blogRepository.repository.save(post);
  }

  /**
   * Unpublish post
   */
  async unpublishPost(postId: string): Promise<BlogPost> {
    if (!postId) {
      throw new ValidationError('Post ID is required');
    }

    const post = await this.blogRepository.repository.findOne({
      where: { id: postId }
    });
    if (!post) {
      throw new AppError(404, 'Post not found');
    }

    post.published = false;
    return await this.blogRepository.repository.save(post);
  }

  /**
   * Search posts
   */
  async searchPosts(query: string, limit: number = 10): Promise<BlogPost[]> {
    if (!query) {
      throw new ValidationError('Search query is required');
    }

    return await this.blogRepository.repository
      .createQueryBuilder('post')
      .where('post.published = true')
      .andWhere('(post.title ILIKE :query OR post.body ILIKE :query)', {
        query: `%${query}%`,
      })
      .orderBy('post.created_at', 'DESC')
      .take(limit)
      .getMany();
  }

  /**
   * Get recent posts
   */
  async getRecentPosts(limit: number = 5): Promise<BlogPost[]> {
    return await this.blogRepository.repository.find({
      where: { published: true },
      relations: ['author'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get posts by author
   */
  async getPostsByAuthor(
    authorId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<{ posts: BlogPost[]; total: number }> {
    if (!authorId) {
      throw new ValidationError('Author ID is required');
    }

    const posts = await this.blogRepository.repository.find({
      where: { author_id: authorId },
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });

    const total = await this.blogRepository.repository.count({
      where: { author_id: authorId },
    });

    return { posts, total };
  }

  /**
   * Get all posts for admin (including unpublished)
   */
  async getAllPostsForAdmin(limit: number = 20, offset: number = 0): Promise<{
    posts: BlogPost[];
    total: number;
  }> {
    const posts = await this.blogRepository.repository.find({
      relations: ['author'],
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });

    const total = await this.blogRepository.repository.count();

    return { posts, total };
  }
}
