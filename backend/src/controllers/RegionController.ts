/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/connection.js';
import { Region } from '../entities/Region.js';
import { RegionRepository } from '../repositories/RegionRepository.js';
import { AppError, ValidationError } from '../utils/errors.js';

/**
 * Cleans the raw `destinations` array from the request body into the shape
 * RegionRepository.replaceDestinations expects. Accepts either plain name
 * strings (legacy admin UI) or { name, best_months } objects (current admin
 * UI, carrying the "best time to visit" months for each destination).
 * Invalid/empty entries and out-of-range month numbers are dropped.
 */
function normalizeDestinations(
  raw: unknown[]
): Array<{ name: string; best_months: number[] }> {
  return raw
    .map((item) => {
      if (typeof item === 'string') {
        return { name: item.trim(), best_months: [] };
      }
      if (item && typeof item === 'object' && 'name' in item) {
        const obj = item as { name?: unknown; best_months?: unknown };
        const name = typeof obj.name === 'string' ? obj.name.trim() : '';
        const best_months = Array.isArray(obj.best_months)
          ? obj.best_months
              .map((m) => Number(m))
              .filter((m) => Number.isInteger(m) && m >= 1 && m <= 12)
          : [];
        return { name, best_months };
      }
      return { name: '', best_months: [] };
    })
    .filter((d) => d.name.length > 0);
}

export class RegionController {
  private regionRepository: RegionRepository;

  constructor() {
    const regionRepo = AppDataSource.getRepository(Region);
    this.regionRepository = new RegionRepository(regionRepo, AppDataSource);
  }

  /**
   * GET /api/regions
   * جلب كل الـ regions الـ active مع الوجهات - للصفحة الرئيسية (public)
   */
  async getAllRegions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const regions = await this.regionRepository.findAllActiveWithDestinations();

      res.status(200).json({
        success: true,
        data: regions,
        count: regions.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/regions/admin
   * جلب كل الـ regions (active + inactive) - للأدمن
   */
  async getAllRegionsAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const regions = await this.regionRepository.findAllWithDestinations();

      res.status(200).json({
        success: true,
        data: regions,
        count: regions.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/regions/:id
   */
  async getRegionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const region = await this.regionRepository.findById(id);
      if (!region) {
        throw new AppError(404, 'Region not found');
      }

      res.status(200).json({
        success: true,
        data: region,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/regions (admin only)
   * body: { name, slug, image?, is_active?, sort_order?, destinations?: string[] }
   */
  async createRegion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, slug, image, is_active, sort_order, destinations } = req.body;

      if (!name || !slug) {
        throw new ValidationError('Name and slug are required');
      }

      const existing = await this.regionRepository.findBySlug(slug);
      if (existing) {
        throw new AppError(400, 'Slug already exists');
      }

      const region = await this.regionRepository.createRegion({
        name,
        slug,
        image,
        is_active,
        sort_order,
      });

      if (Array.isArray(destinations) && destinations.length > 0) {
        await this.regionRepository.replaceDestinations(
          region.id,
          normalizeDestinations(destinations)
        );
      }

      const full = await this.regionRepository.findById(region.id);

      res.status(201).json({
        success: true,
        message: 'Region created successfully',
        data: full,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/regions/:id (admin only)
   * body: { name?, slug?, image?, is_active?, sort_order?, destinations?: string[] }
   */
  async updateRegion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, slug, image, is_active, sort_order, destinations } = req.body;

      const existing = await this.regionRepository.findById(id);
      if (!existing) {
        throw new AppError(404, 'Region not found');
      }

      await this.regionRepository.updateRegion(id, {
        name,
        slug,
        image,
        is_active,
        sort_order,
      });

      if (Array.isArray(destinations)) {
        await this.regionRepository.replaceDestinations(
          id,
          normalizeDestinations(destinations)
        );
      }

      const updated = await this.regionRepository.findById(id);

      res.status(200).json({
        success: true,
        message: 'Region updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/regions/:id (admin only)
   */
  async deleteRegion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const existing = await this.regionRepository.findById(id);
      if (!existing) {
        throw new AppError(404, 'Region not found');
      }

      await this.regionRepository.deleteRegion(id);

      res.status(200).json({
        success: true,
        message: 'Region deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
