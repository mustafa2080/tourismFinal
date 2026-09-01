import cron, { ScheduledTask } from 'node-cron';
import { AppDataSource } from '../config/connection.js';
import { Booking } from '../entities/Booking.js';
import { Notification } from '../entities/Notification.js';
import { EmailService } from '../services/EmailService.js';
import { User } from '../entities/User.js';

export class CronJobs {
  private static tasks: ScheduledTask[] = [];
  private static emailService: EmailService | null = null;
  private static initialized = false;

  /**
   * بدء جميع الـ Cron Jobs - آمن وخالي من الأخطاء
   */
  static startAll(): void {
    console.log('🚀 Starting cron jobs...');

    if (this.initialized) {
      console.warn('⚠️ Cron jobs already started');
      return;
    }

    try {
      // Initialize email service
      try {
        this.emailService = new EmailService();
        console.log('✅ EmailService initialized');
      } catch (error) {
        console.warn('⚠️ EmailService failed to initialize, reminder emails will be skipped');
        this.emailService = null;
      }

      // كل ساعة: التحقق من التذكيرات القادمة
      this.scheduleDailyReminders();

      // كل يوم في الساعة 2 صباحاً: تنظيف الإشعارات القديمة
      this.scheduleCleanupOldNotifications();

      // كل 6 ساعات: تنظيف الحجوزات المعلقة القديمة
      this.scheduleCleanupOldPendingBookings();

      console.log('✅ All cron jobs scheduled successfully');
      this.initialized = true;
    } catch (error) {
      console.error('Error starting cron jobs:', error);
    }
  }

  /**
   * التحقق من الحجوزات القادمة وإرسال التذكيرات
   */
  private static scheduleDailyReminders(): void {
    // كل ساعة واحدة
    const task = cron.schedule('0 * * * *', async () => {
      await this.checkAndSendReminders();
    });

    this.tasks.push(task);
    console.log('⏱️ Scheduled: Daily reminders (every hour)');
  }

  /**
   * التحقق من الحجوزات والتذكيرات المطلوبة
   */
  private static async checkAndSendReminders(): Promise<void> {
    try {
      if (!AppDataSource.isInitialized) {
        return;
      }

      console.log('🔍 Checking for upcoming trips...');

      const bookingRepository = AppDataSource.getRepository(Booking);
      const userRepository = AppDataSource.getRepository(User);
      const notificationRepository = AppDataSource.getRepository(Notification);

      const reminderDays = [7, 3, 1];

      for (const days of reminderDays) {
        try {
          const targetDate = new Date();
          targetDate.setDate(targetDate.getDate() + days);
          const startOfDay = new Date(targetDate);
          startOfDay.setHours(0, 0, 0, 0);

          const endOfDay = new Date(targetDate);
          endOfDay.setHours(23, 59, 59, 999);

          const bookings = await bookingRepository
            .createQueryBuilder('booking')
            .leftJoinAndSelect('booking.package', 'package')
            .where('booking.status = :status', { status: 'confirmed' })
            .andWhere('booking.date_start BETWEEN :startDate AND :endDate', {
              startDate: startOfDay,
              endDate: endOfDay,
            })
            .getMany();

          if (bookings.length > 0) {
            console.log(`📬 Found ${bookings.length} trip(s) - ${days} day(s) before departure`);

            for (const booking of bookings) {
              try {
                const user = await userRepository.findOne({
                  where: { id: booking.user_id },
                });

                if (!user) continue;

                const subject = days === 7
                  ? 'Reminder: Your trip starts in 7 days!'
                  : days === 3
                    ? 'Reminder: Your trip starts in 3 days!'
                    : 'Last Reminder: Your trip starts tomorrow!';

                // Try to send email if service is available
                if (this.emailService) {
                  try {
                    await this.emailService.sendReminderEmail(
                      user.email,
                      subject,
                      `Hi ${user.name}, your trip starts in ${days} day(s)!`
                    );
                  } catch (emailError) {
                    console.warn(`Email failed for ${user.email}:`, emailError);
                  }
                }

                // Create in-app notification
                try {
                  const notification = notificationRepository.create({
                    user_id: booking.user_id,
                    type: 'booking_reminder',
                    payload: {
                      bookingId: booking.id,
                      packageTitle: booking.package?.title,
                      daysUntilTrip: days,
                    } as any,
                  });
                  await notificationRepository.save(notification);
                } catch (notifError) {
                  console.error('Notification save failed:', notifError);
                }
              } catch (error) {
                console.error(`Error processing booking ${booking.booking_number}:`, error);
              }
            }
          }
        } catch (error) {
          console.error(`Error checking ${days}-day reminders:`, error);
        }
      }
    } catch (error) {
      console.error('Error in checkAndSendReminders:', error);
    }
  }

  /**
   * تنظيف الإشعارات القديمة
   */
  private static scheduleCleanupOldNotifications(): void {
    const task = cron.schedule('0 2 * * *', async () => {
      await this.cleanupOldNotifications();
    });

    this.tasks.push(task);
    console.log('⏱️ Scheduled: Cleanup old notifications (daily at 2 AM)');
  }

  /**
   * تنظيف الإشعارات القديمة من قاعدة البيانات
   */
  private static async cleanupOldNotifications(): Promise<void> {
    try {
      if (!AppDataSource.isInitialized) {
        return;
      }

      console.log('🗑️ Cleaning up old notifications...');

      const notificationRepository = AppDataSource.getRepository(Notification);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await notificationRepository
        .createQueryBuilder()
        .delete()
        .where('created_at < :date', { date: thirtyDaysAgo })
        .execute();

      if (result.affected && result.affected > 0) {
        console.log(`✅ Deleted ${result.affected} old notifications`);
      }
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
    }
  }

  /**
   * تنظيف الحجوزات المعلقة القديمة
   */
  private static scheduleCleanupOldPendingBookings(): void {
    const task = cron.schedule('0 */6 * * *', async () => {
      await this.cleanupOldPendingBookings();
    });

    this.tasks.push(task);
    console.log('⏱️ Scheduled: Cleanup old pending bookings (every 6 hours)');
  }

  /**
   * حذف الحجوزات المعلقة القديمة
   */
  private static async cleanupOldPendingBookings(): Promise<void> {
    try {
      if (!AppDataSource.isInitialized) {
        return;
      }

      console.log('🗑️ Cleaning up old pending bookings...');

      const bookingRepository = AppDataSource.getRepository(Booking);
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const result = await bookingRepository
        .createQueryBuilder()
        .delete()
        .where('status = :status', { status: 'pending' })
        .andWhere('created_at < :date', { date: oneDayAgo })
        .execute();

      if (result.affected && result.affected > 0) {
        console.log(`✅ Deleted ${result.affected} old pending bookings`);
      }
    } catch (error) {
      console.error('Error cleaning up pending bookings:', error);
    }
  }

  /**
   * إيقاف جميع الـ Cron Jobs
   */
  static stopAll(): void {
    console.log('⏹️ Stopping all cron jobs...');
    this.tasks.forEach(task => {
      try {
        task.stop();
        task.destroy();
      } catch (error) {
        console.error('Error stopping task:', error);
      }
    });
    this.tasks = [];
    this.initialized = false;
    console.log('✅ All cron jobs stopped');
  }
}
