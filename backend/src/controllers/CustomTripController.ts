/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/connection.js';
import { CustomTripRequest } from '../entities/CustomTripRequest.js';
import { TripBuilderOption } from '../entities/TripBuilderOption.js';
import { CustomTripService } from '../services/CustomTripService.js';
import { TripBuilderOptionService } from '../services/TripBuilderOptionService.js';

export class CustomTripController {
  private tripService: CustomTripService;
  private optionService: TripBuilderOptionService;

  constructor() {
    this.tripService = new CustomTripService(AppDataSource.getRepository(CustomTripRequest));
    this.optionService = new TripBuilderOptionService(AppDataSource.getRepository(TripBuilderOption));
  }

  // ===================== PUBLIC =====================

  /** GET /api/custom-trips/options */
  async getOptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { destination, item_type } = req.query;
      const options = await this.optionService.getActive(
        destination as string | undefined,
        item_type as string | undefined
      );
      res.status(200).json({ success: true, data: options });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/custom-trips/destinations */
  async getDestinations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const destinations = await this.optionService.getDestinations();
      res.status(200).json({ success: true, data: destinations });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/custom-trips */
  async submitRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const request = await this.tripService.submitRequest({
        ...req.body,
        user_id: userId,
      });
      res.status(201).json({
        success: true,
        message: 'Your custom trip request has been submitted successfully.',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/custom-trips/mine */
  async getMyRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);
      const result = await this.tripService.getByUser(userId, limit, offset);
      res.status(200).json({
        success: true,
        data: result.requests,
        pagination: { limit, offset, total: result.total },
      });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/custom-trips/:id */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await this.tripService.getById(req.params.id);
      res.status(200).json({ success: true, data: request });
    } catch (error) {
      next(error);
    }
  }

  // ===================== ADMIN =====================

  /** GET /api/admin/custom-trips */
  async getAllAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);
      const status = req.query.status as string | undefined;
      const result = await this.tripService.getAll(limit, offset, status);
      res.status(200).json({
        success: true,
        data: result.requests,
        pagination: { limit, offset, total: result.total },
      });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/admin/custom-trips/stats */
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.tripService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  /** PUT /api/admin/custom-trips/:id/status */
  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, adminNotes } = req.body;
      const adminId = req.user!.userId;
      const request = await this.tripService.updateStatus(req.params.id, status, adminId, adminNotes);
      res.status(200).json({ success: true, message: 'Status updated', data: request });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/admin/custom-trips/:id/quote */
  async sendQuote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { quotedPrice, quoteMessage } = req.body;
      const adminId = req.user!.userId;
      const request = await this.tripService.sendQuote(req.params.id, quotedPrice, quoteMessage, adminId);
      res.status(200).json({ success: true, message: 'Quote sent', data: request });
    } catch (error) {
      next(error);
    }
  }

  /** DELETE /api/admin/custom-trips/:id */
  async deleteRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.tripService.deleteRequest(req.params.id);
      res.status(200).json({ success: true, message: 'Custom trip request deleted' });
    } catch (error) {
      next(error);
    }
  }

  // ---- Trip Builder Options (Admin catalog CRUD) ----

  /** GET /api/admin/custom-trips/options */
  async getOptionsAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.max(1, parseInt(req.query.limit as string) || 100);
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);
      const result = await this.optionService.getAllAdmin(limit, offset);
      res.status(200).json({
        success: true,
        data: result.options,
        pagination: { limit, offset, total: result.total },
      });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/admin/custom-trips/options */
  async createOption(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const option = await this.optionService.create(req.body);
      res.status(201).json({ success: true, message: 'Option created', data: option });
    } catch (error) {
      next(error);
    }
  }

  /** PUT /api/admin/custom-trips/options/:id */
  async updateOption(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const option = await this.optionService.update(req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Option updated', data: option });
    } catch (error) {
      next(error);
    }
  }

  /** DELETE /api/admin/custom-trips/options/:id */
  async deleteOption(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.optionService.delete(req.params.id);
      res.status(200).json({ success: true, message: 'Option deleted' });
    } catch (error) {
      next(error);
    }
  }
}
