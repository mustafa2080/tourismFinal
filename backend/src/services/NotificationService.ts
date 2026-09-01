import { Notification } from '../entities/Notification.js';
import { NotificationRepository } from '../repositories/NotificationRepository.js';
import { ValidationError, AppError } from '../utils/errors.js';
import { AppDataSource } from '../config/connection.js';

export type NotificationType =
  | 'booking:created'
  | 'booking:confirmed'
  | 'booking:cancelled'
  | 'booking:reminder'
  | 'review:approved'
  | 'review:rejected'
  | 'admin:alert'
  | 'general';

export class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor() {
    const typeormRepo = AppDataSource.getRepository(Notification);
    this.notificationRepository = new NotificationRepository(typeormRepo);
  }

  /**
   * Create a new notification
   */
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    payload?: any
  ): Promise<Notification> {
    if (!userId || !type || !title || !message) {
      throw new ValidationError('UserId, type, title, and message are required');
    }

    const notification = this.notificationRepository.repository.create({
      user_id: userId,
      type,
      title,
      message,
      payload: payload || {},
      is_read: false,
      created_at: new Date(),
    });

    return await this.notificationRepository.repository.save(notification);
  }

  /**
   * Get user's notifications (paginated)
   */
  async getUserNotifications(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ notifications: Notification[]; total: number }> {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    const notifications = await this.notificationRepository.repository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });

    const total = await this.notificationRepository.repository.count({
      where: { user_id: userId },
    });

    return { notifications, total };
  }

  /**
   * Get unread notifications
   */
  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    return await this.notificationRepository.repository.find({
      where: { user_id: userId, is_read: false },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    if (!notificationId) {
      throw new ValidationError('Notification ID is required');
    }

    const notification = await this.notificationRepository.repository.findOne({
      where: { id: notificationId }
    });
    if (!notification) {
      throw new AppError(404, 'Notification not found');
    }

    notification.is_read = true;
    return await this.notificationRepository.repository.save(notification);
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    const notifications = await this.notificationRepository.repository.find({
      where: { user_id: userId, is_read: false },
    });

    notifications.forEach(notif => {
      notif.is_read = true;
    });

    await this.notificationRepository.repository.save(notifications);
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    if (!notificationId) {
      throw new ValidationError('Notification ID is required');
    }

    const notification = await this.notificationRepository.repository.findOne({
      where: { id: notificationId }
    });
    if (!notification) {
      throw new AppError(404, 'Notification not found');
    }

    if (notification.user_id !== userId) {
      throw new AppError(403, 'You can only delete your own notifications');
    }

    await this.notificationRepository.repository.remove(notification);
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAllNotifications(userId: string): Promise<void> {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    await this.notificationRepository.repository.delete({
      user_id: userId,
    });
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    return await this.notificationRepository.repository.count({
      where: { user_id: userId, is_read: false },
    });
  }

  /**
   * Get notifications by type
   */
  async getNotificationsByType(
    userId: string,
    type: NotificationType,
    limit: number = 10,
    offset: number = 0
  ): Promise<{ notifications: Notification[]; total: number }> {
    if (!userId || !type) {
      throw new ValidationError('User ID and type are required');
    }

    const notifications = await this.notificationRepository.repository.find({
      where: { user_id: userId, type },
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });

    const total = await this.notificationRepository.repository.count({
      where: { user_id: userId, type },
    });

    return { notifications, total };
  }

  /**
   * Create booking confirmation notification
   */
  async notifyBookingCreated(
    userId: string,
    bookingData: {
      bookingNumber: string;
      packageTitle: string;
      tripDate: string;
      totalPrice: number;
      bookingId?: string; // Add booking ID for navigation
    }
  ): Promise<Notification> {
    return await this.createNotification(
      userId,
      'booking:created',
      'Booking Confirmed! 🎉',
      `Your booking ${bookingData.bookingNumber} for ${bookingData.packageTitle} has been confirmed.`,
      {
        bookingNumber: bookingData.bookingNumber,
        packageTitle: bookingData.packageTitle,
        tripDate: bookingData.tripDate,
        totalPrice: bookingData.totalPrice,
        relatedId: bookingData.bookingId, // For navigation to booking details
        type: 'booking:created',
      }
    );
  }

  /**
   * Create booking reminder notification
   */
  async notifyBookingReminder(
    userId: string,
    bookingData: {
      bookingNumber: string;
      packageTitle: string;
      tripDate: string;
      daysRemaining: number;
      bookingId?: string; // Add booking ID for navigation
    }
  ): Promise<Notification> {
    const message =
      bookingData.daysRemaining === 1
        ? `Your trip ${bookingData.packageTitle} is tomorrow! Get ready for an amazing adventure.`
        : `Your trip ${bookingData.packageTitle} starts in ${bookingData.daysRemaining} days.`;

    return await this.createNotification(
      userId,
      'booking:reminder',
      `Trip Reminder - ${bookingData.daysRemaining} days left ⏰`,
      message,
      {
        ...bookingData,
        relatedId: bookingData.bookingId, // For navigation
        type: 'booking:reminder',
      }
    );
  }

  /**
   * Create booking cancellation notification
   */
  async notifyBookingCancelled(
    userId: string,
    bookingData: {
      bookingNumber: string;
      packageTitle: string;
      reason?: string;
      bookingId?: string; // Add booking ID for navigation
    }
  ): Promise<Notification> {
    return await this.createNotification(
      userId,
      'booking:cancelled',
      'Booking Cancelled ❌',
      `Your booking ${bookingData.bookingNumber} for ${bookingData.packageTitle} has been cancelled.`,
      {
        ...bookingData,
        relatedId: bookingData.bookingId, // For navigation
        type: 'booking:cancelled',
      }
    );
  }

  /**
   * Create review approved notification
   */
  async notifyReviewApproved(
    userId: string,
    packageTitle: string
  ): Promise<Notification> {
    return await this.createNotification(
      userId,
      'review:approved',
      'Review Published! ✨',
      `Your review for ${packageTitle} has been approved and is now visible to other travelers.`,
      { packageTitle }
    );
  }

  /**
   * Create admin alert notification
   */
  async notifyAdmin(
    adminUserId: string,
    alertData: {
      type: string;
      message: string;
      actionUrl?: string;
      data?: any;
    }
  ): Promise<Notification> {
    return await this.createNotification(
      adminUserId,
      'admin:alert',
      `Admin Alert - ${alertData.type}`,
      alertData.message,
      alertData
    );
  }
}
