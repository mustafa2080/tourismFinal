/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/connection.js';
import { Category } from '../entities/Category.js';
import { CategoryRepository } from '../repositories/CategoryRepository.js';
import { AppError, ValidationError } from '../utils/errors.js';

export class CategoryController {
  private categoryRepository: CategoryRepository;

  constructor() {
    const categoryRepo = AppDataSource.getRepository(Category);
    this.categoryRepository = new CategoryRepository(categoryRepo);
  }

  /**
   * GET /api/categories
   * جلب جميع الـ categories
   */
  async getAllCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('📂 [CategoryController.getAllCategories] Fetching all categories');
      
      const categories = await this.categoryRepository.findAll();

      console.log(`✅ [CategoryController.getAllCategories] Returning ${categories.length} categories`);

      res.status(200).json({
        success: true,
        data: categories,
        count: categories.length,
      });
    } catch (error) {
      console.error('❌ [CategoryController.getAllCategories] Error:', error);
      next(error);
    }
  }

  /**
   * GET /api/categories/:id
   * جلب category بـ ID
   */
  async getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const category = await this.categoryRepository.findById(id);
      if (!category) {
        throw new AppError(404, 'Category not found');
      }

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/categories (admin only)
   * إنشاء category جديدة
   */
  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, slug, description, image } = req.body;

      if (!name || !slug) {
        throw new ValidationError('Name and slug are required');
      }

      // التحقق من عدم تكرار الـ slug
      const existing = await this.categoryRepository.findBySlug(slug);
      if (existing) {
        throw new AppError(400, 'Slug already exists');
      }

      const category = await this.categoryRepository.createCategory({
        name,
        slug,
        description,
        image,
      });

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/categories/:id (admin only)
   * تحديث category
   */
  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, slug, description, image } = req.body;

      const existing = await this.categoryRepository.findById(id);
      if (!existing) {
        throw new AppError(404, 'Category not found');
      }

      const updated = await this.categoryRepository.updateCategory(id, {
        name,
        slug,
        description,
        image,
      });

      res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/categories/:id (admin only)
   * حذف category
   */
  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const existing = await this.categoryRepository.findById(id);
      if (!existing) {
        throw new AppError(404, 'Category not found');
      }

      await this.categoryRepository.deleteCategory(id);

      res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/categories/with-packages
   * جلب categories مع عدد الـ packages في كل واحدة
   */
  async getCategoriesWithPackageCount(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const categories = await this.categoryRepository.findAllWithPackageCount();

      res.status(200).json({
        success: true,
        data: categories,
        count: categories.length,
      });
    } catch (error) {
      next(error);
    }
  }
}
