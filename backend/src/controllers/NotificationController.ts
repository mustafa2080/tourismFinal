/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/NotificationService';
import { AppError } from '../utils/errors';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * GET /api/notifications
   * Get user's notifications
   */
  async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

      const result = await this.notificationService.getUserNotifications(userId, limit, offset);

      res.status(200).json({
        success: true,
        data: result.notifications,
        pagination: {
          limit,
          offset,
          total: result.total,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications/unread
   * Get unread notifications count
   */
  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      const count = await this.notificationService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        data: {
          unreadCount: count,
        },
        unreadCount: count, // for backward compatibility
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications/unread/list
   * Get all unread notifications
   */
  async getUnreadNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      const notifications = await this.notificationService.getUnreadNotifications(userId);

      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/notifications/:id/read
   * Mark notification as read
   */
  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      const { id } = req.params;

      const notification = await this.notificationService.markAsRead(id);

      // Verify it's the user's notification
      if (notification.user_id !== userId) {
        throw new AppError(403, 'You can only mark your own notifications as read');
      }

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/notifications/read-all
   * Mark all notifications as read
   */
  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      await this.notificationService.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/notifications/:id
   * Delete a notification
   */
  async deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      const { id } = req.params;

      await this.notificationService.deleteNotification(id, userId);

      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/notifications
   * Delete all notifications
   */
  async deleteAllNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      await this.notificationService.deleteAllNotifications(userId);

      res.status(200).json({
        success: true,
        message: 'All notifications deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications/type/:type
   * Get notifications by type
   */
  async getNotificationsByType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      const { type } = req.params;
      const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

      const result = await this.notificationService.getNotificationsByType(
        userId,
        type as any,
        limit,
        offset
      );

      res.status(200).json({
        success: true,
        data: result.notifications,
        pagination: {
          limit,
          offset,
          total: result.total,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
