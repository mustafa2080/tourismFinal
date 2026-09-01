import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/connection.js';
import { Itinerary } from '../entities/Itinerary.js';
import { ItineraryService } from '../services/ItineraryService.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export class ItineraryController {
  private itineraryService: ItineraryService;

  constructor() {
    const itineraryRepository = AppDataSource.getRepository(Itinerary);
    this.itineraryService = new ItineraryService(itineraryRepository);
  }

  /**
   * GET /itineraries/:packageId
   * Get all itinerary days for a package
   */
  async getPackageItineraries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { packageId } = req.params;

      console.log(`📅 [Itinerary] Fetching itineraries for package: ${packageId}`);

      const itineraries = await this.itineraryService.getItinerariesByPackage(packageId);

      // Debug log to see what we're returning
      if (itineraries && itineraries.length > 0) {
        console.log(`📅 [Itinerary] First itinerary data:`, {
          id: itineraries[0].id,
          title: itineraries[0].title,
          es_title: itineraries[0].es_title,
          en_title: itineraries[0].en_title,
          ar_title: itineraries[0].ar_title,
          description: itineraries[0].description,
          es_description: itineraries[0].es_description,
          activities: itineraries[0].activities,
          es_activities: itineraries[0].es_activities,
          meals: itineraries[0].meals,
          es_meals: itineraries[0].es_meals,
          allKeys: Object.keys(itineraries[0])
        });
      }

      res.status(200).json({
        success: true,
        data: itineraries,
        message: `Retrieved ${itineraries.length} itinerary days`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /itineraries/:id
   * Get specific itinerary day by ID
   */
  async getItineraryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      console.log(`📅 [Itinerary] Fetching itinerary: ${id}`);

      const itinerary = await this.itineraryService.getItineraryById(id);

      res.status(200).json({
        success: true,
        data: itinerary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /itineraries
   * Create new itinerary day (Admin only)
   */
  async createItinerary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { package_id, day_number, title, description, image_url, activities, meals } = req.body;

      console.log(`📅 [Itinerary] Creating itinerary for package:`, {
        package_id,
        day_number,
        title,
      });

      // Validate required fields
      if (!package_id || !day_number || !title || !description) {
        res.status(400).json({
          success: false,
          error: 'package_id, day_number, title, and description are required',
        });
        return;
      }

      const itinerary = await this.itineraryService.createItinerary(
        package_id,
        day_number,
        {
          title,
          description,
          image_url,
          activities,
          meals,
        }
      );

      res.status(201).json({
        success: true,
        data: itinerary,
        message: `Itinerary day ${day_number} created successfully`,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        next(error);
      }
    }
  }

  /**
   * PUT /itineraries/:id
   * Update itinerary day (Admin only)
   */
  async updateItinerary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { title, description, image_url, activities, meals } = req.body;

      console.log(`📅 [Itinerary] Updating itinerary: ${id}`);

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (image_url !== undefined) updateData.image_url = image_url;
      if (activities !== undefined) updateData.activities = activities;
      if (meals !== undefined) updateData.meals = meals;

      const updated = await this.itineraryService.updateItinerary(id, updateData);

      res.status(200).json({
        success: true,
        data: updated,
        message: 'Itinerary updated successfully',
      });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        res.status(error instanceof NotFoundError ? 404 : 400).json({
          success: false,
          error: error.message,
        });
      } else {
        next(error);
      }
    }
  }

  /**
   * DELETE /itineraries/:id
   * Delete itinerary day (Admin only)
   */
  async deleteItinerary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      console.log(`📅 [Itinerary] Deleting itinerary: ${id}`);

      await this.itineraryService.deleteItinerary(id);

      res.status(200).json({
        success: true,
        message: 'Itinerary deleted successfully',
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ success: false, error: error.message });
      } else {
        next(error);
      }
    }
  }

  /**
   * POST /itineraries/upsert
   * Update or create itinerary day
   */
  async upsertItinerary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { package_id, day_number, title, description, image_url, activities, meals } = req.body;

      console.log(`📅 [Itinerary] Upserting itinerary:`, { package_id, day_number });

      if (!package_id || !day_number) {
        res.status(400).json({
          success: false,
          error: 'package_id and day_number are required',
        });
        return;
      }

      const itinerary = await this.itineraryService.upsertItinerary(package_id, day_number, {
        title,
        description,
        image_url,
        activities,
        meals,
      });

      res.status(200).json({
        success: true,
        data: itinerary,
        message: 'Itinerary upserted successfully',
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        next(error);
      }
    }
  }
}
