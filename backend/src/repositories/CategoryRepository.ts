import { Repository } from 'typeorm';
import { Category } from '../entities/Category.js';
import { BaseRepository } from './BaseRepository.js';

export class CategoryRepository extends BaseRepository<Category> {
  constructor(repository: Repository<Category>) {
    super(repository);
  }

  /**
   * جلب جميع الـ categories مع معلومات الـ packages
   */
  async findAll(): Promise<Category[]> {
    console.log('🔍 [CategoryRepository.findAll] Fetching all categories');
    
    try {
      // Don't load relations to avoid circular dependencies
      const categories = await this.repository.find({
        order: { created_at: 'DESC' },
      });

      console.log(`✅ [CategoryRepository.findAll] Found ${categories.length} categories`);
      categories.forEach((cat, idx) => {
        console.log(`   Category ${idx + 1}: "${cat.name}" (${cat.id})`);
      });

      return categories;
    } catch (error) {
      console.error('❌ [CategoryRepository.findAll] Error:', error);
      throw error;
    }
  }

  /**
   * جلب category بـ ID
   */
  async findById(id: string): Promise<Category | null> {
    return await this.repository.findOne({
      where: { id },
    });
  }

  /**
   * البحث بـ slug
   */
  async findBySlug(slug: string): Promise<Category | null> {
    return await this.repository.findOne({ where: { slug } });
  }

  /**
   * إنشاء category جديدة
   */
  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
    image?: string;
  }): Promise<Category> {
    const category = this.repository.create(data);
    return await this.repository.save(category);
  }

  /**
   * تحديث category
   */
  async updateCategory(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      description: string;
      image: string;
    }>
  ): Promise<Category> {
    await this.repository.update(id, data);
    return (await this.repository.findOne({ where: { id } }))!;
  }

  /**
   * حذف category
   */
  async deleteCategory(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  /**
   * جلب categories مع عدد الـ packages
   */
  async findAllWithPackageCount(): Promise<any[]> {
    try {
      const result = await this.repository.query(`
        SELECT 
          c.id,
          c.name,
          c.slug,
          c.description,
          c.image,
          c.created_at,
          COUNT(DISTINCT pc.package_id) as "packageCount"
        FROM categories c
        LEFT JOIN package_categories pc ON c.id = pc.category_id
        GROUP BY c.id, c.name, c.slug, c.description, c.image, c.created_at
        ORDER BY c.created_at DESC
      `);
      return result;
    } catch (error) {
      console.error('Error in findAllWithPackageCount:', error);
      // Fallback: return categories without count
      const categories = await this.repository.find();
      return categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image,
        packageCount: 0,
        created_at: c.created_at
      }));
    }
  }

  async findWithPackages(): Promise<Category[]> {
    return await this.repository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findCategoryPackages(categoryId: string): Promise<any> {
    return await this.repository.findOne({
      where: { id: categoryId },
    });
  }
}
