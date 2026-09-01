import { Repository } from 'typeorm';
import { Notification } from '../entities/Notification.js';
import { BaseRepository } from './BaseRepository.js';

export class NotificationRepository extends BaseRepository<Notification> {
  constructor(repository: Repository<Notification>) {
    super(repository);
  }

  async findUserNotifications(userId: string): Promise<Notification[]> {
    return await this.repository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async findUnreadNotifications(userId: string): Promise<Notification[]> {
    return await this.repository.find({
      where: { user_id: userId, is_read: false },
      order: { created_at: 'DESC' },
    });
  }

  async markAsRead(id: string): Promise<void> {
    await this.repository.update(id, { is_read: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repository.update({ user_id: userId }, { is_read: true });
  }

  async deleteOldNotifications(daysOld: number): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - daysOld);

    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .where('created_at < :date', { date })
      .execute();

    return result.affected || 0;
  }
}
