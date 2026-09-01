import Queue, { Job } from 'bull';
import { logger } from '../middleware/logger.js';
import { AppDataSource } from '../config/connection.js';
import { Booking } from '../entities/Booking.js';
import { EmailService } from '../services/EmailService.js';
import { getWebSocketService } from '../websocket/index.js';

interface ReminderJobData {
  bookingId: string;
  userId: string;
  daysBeforeTrip: number; // 7, 3, أو 1
}

export class ReminderQueue {
  private queue: Queue.Queue<ReminderJobData>;
  private emailService: EmailService;

  constructor() {
    // إنشاء Queue التذكيرات
    this.queue = new Queue<ReminderJobData>('reminders', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    });

    this.emailService = new EmailService();

    // معالج الوظائف
    this.setupProcessors();

    // معالجات الأحداث
    this.setupEventHandlers();
  }

  /**
   * إضافة وظيفة تذكير إلى الطابور
   */
  async addReminderJob(data: ReminderJobData): Promise<Job<ReminderJobData>> {
    try {
      const job = await this.queue.add(data, {
        attempts: 2,
        removeOnComplete: true,
      });

      logger.info(
        `📬 Reminder job added: ${job.id} - Booking: ${data.bookingId} (${data.daysBeforeTrip} days before)`
      );
      return job;
    } catch (error) {
      logger.error('Failed to add reminder job:', error);
      throw error;
    }
  }

  /**
   * معالجات الوظائف
   */
  private setupProcessors(): void {
    this.queue.process(async (job: Job<ReminderJobData>) => {
      try {
        const data = job.data;
        logger.info(`⏳ Processing reminder job: ${job.id}`);

        if (!AppDataSource.isInitialized) {
          logger.warn('⚠️ Database not initialized');
          throw new Error('Database not initialized');
        }

        // جلب الحجز
        const bookingRepository = AppDataSource.getRepository(Booking);
        const booking = await bookingRepository.findOne({
          where: { id: data.bookingId },
          relations: ['user', 'package'],
        });

        if (!booking) {
          logger.warn(`Booking not found: ${data.bookingId}`);
          return { success: false, reason: 'Booking not found' };
        }

        if (!booking.user || !booking.package) {
          logger.warn(`Missing user or package for booking: ${data.bookingId}`);
          return { success: false, reason: 'Missing relations' };
        }

        // إعداد بيانات الحجز للبريد
        const bookingData = {
          bookingNumber: booking.booking_number,
          guestName: booking.user.name,
          guestEmail: booking.user.email,
          guestPhone: booking.user.phone || '',
          packageTitle: booking.package.title,
          destination: booking.package.destination,
          tripStartDate: booking.date_start.toISOString().split('T')[0],
          totalPrice: booking.total_price,
          persons: booking.persons,
        };

        // إرسال بريد التذكير
        await this.emailService.sendBookingReminder(
          booking.user.email,
          data.daysBeforeTrip
        );

        logger.info(
          `✉️ Reminder email sent to ${booking.user.email} (${data.daysBeforeTrip} days until trip)`
        );

        // إرسال إخطار WebSocket (إذا كانت الخدمة متاحة)
        try {
          const wsService = getWebSocketService();
          if (wsService) {
            wsService.notifyBookingReminder(data.bookingId, data.userId, data.daysBeforeTrip);
          }
        } catch (wsError) {
          logger.warn('WebSocket notification failed:', wsError);
          // لا نفشل الـ job بسبب WebSocket
        }

        return { success: true };
      } catch (error) {
        logger.error(`Failed to process reminder job ${job.id}:`, error);
        throw error;
      }
    });
  }

  /**
   * معالجات أحداث الـ Queue
   */
  private setupEventHandlers(): void {
    this.queue.on('completed', (job: Job<ReminderJobData>) => {
      logger.info(
        `✅ Reminder job completed: ${job.id} - Booking: ${job.data.bookingId}`
      );
    });

    this.queue.on('failed', (job: Job<ReminderJobData>, error: Error) => {
      logger.error(
        `❌ Reminder job failed: ${job.id} - ${error.message}`
      );
    });

    this.queue.on('error', (error: Error) => {
      logger.error('Reminder queue error:', error);
    });
  }

  /**
   * تنظيف الـ Queue
   */
  async close(): Promise<void> {
    await this.queue.close();
    logger.info('Reminder queue closed');
  }

  /**
   * جلب حالة الـ Queue
   */
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }> {
    const [waiting, active, completed, failed] = await Promise.all([
      this.queue.count(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
    ]);

    return { waiting, active, completed, failed };
  }
}

// Export singleton instance
let reminderQueueInstance: ReminderQueue | null = null;

export function getReminderQueue(): ReminderQueue {
  if (!reminderQueueInstance) {
    reminderQueueInstance = new ReminderQueue();
  }
  return reminderQueueInstance;
}
