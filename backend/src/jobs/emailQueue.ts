import Queue, { Job } from 'bull';
import { logger } from '../middleware/logger.js';
import { EmailService } from '../services/EmailService.js';

interface EmailJobData {
  type: 'welcome' | 'booking_confirmation' | 'reminder' | 'cancellation' | 'password_reset' | 'contact_reply';
  to: string;
  userName?: string;
  bookingData?: {
    bookingNumber: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    packageTitle: string;
    destination: string;
    tripStartDate: string;
    tripEndDate?: string;
    totalPrice: number;
    persons: number;
    extras?: Array<{ name: string; price: number }>;
  };
  daysRemaining?: number;
  refundAmount?: number;
  resetLink?: string;
  message?: string;
}

export class EmailQueue {
  private queue: Queue.Queue<EmailJobData>;
  private emailService: EmailService;

  constructor() {
    // إنشاء Queue البريد الإلكتروني
    this.queue = new Queue<EmailJobData>('emails', {
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
   * إضافة وظيفة بريد إلى الطابور
   */
  async addEmailJob(data: EmailJobData): Promise<Job<EmailJobData>> {
    try {
      const job = await this.queue.add(data, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
      });

      logger.info(
        `📧 Email job added to queue: ${job.id} - Type: ${data.type}`
      );
      return job;
    } catch (error) {
      logger.error('Failed to add email job to queue:', error);
      throw error;
    }
  }

  /**
   * معالجات الوظائف
   */
  private setupProcessors(): void {
    this.queue.process(async (job: Job<EmailJobData>) => {
      try {
        const data = job.data;

        logger.info(
          `⏳ Processing email job: ${job.id} - Type: ${data.type}`
        );

        switch (data.type) {
          case 'welcome':
            await this.emailService.sendWelcomeEmail(
              data.to,
              data.userName || 'User'
            );
            logger.info(`✉️ Welcome email sent to ${data.to}`);
            break;

          case 'booking_confirmation':
            if (data.bookingData) {
              await this.emailService.sendBookingConfirmation(
                data.bookingData,
                data.to,
                data.bookingData.packageTitle || 'Tour Package'
              );
              logger.info(`✉️ Booking confirmation sent to ${data.to}`);
            }
            break;

          case 'reminder':
            if (data.bookingData) {
              await this.emailService.sendBookingReminder(
                data.to,
                data.daysRemaining || 3
              );
              logger.info(
                `✉️ Reminder sent to ${data.to}`
              );
            }
            break;

          case 'cancellation':
            if (data.bookingData) {
              await this.emailService.sendCancellationConfirmation(
                data.to,
                data.bookingData.bookingNumber,
                data.bookingData.packageTitle
              );
              logger.info(`✉️ Cancellation confirmation sent to ${data.to}`);
            }
            break;

          case 'password_reset':
            if (data.resetLink && data.userName) {
              await this.emailService.sendPasswordReset(
                data.to,
                data.resetLink,
                data.userName
              );
              logger.info(`✉️ Password reset email sent to ${data.to}`);
            }
            break;

          case 'contact_reply':
            if (data.message) {
              await this.emailService.sendContactReply(
                data.to,
                data.message,
                'Re: Your Message'
              );
              logger.info(`✉️ Contact reply sent to ${data.to}`);
            }
            break;

          default:
            logger.warn(`Unknown email type: ${data.type}`);
        }

        return { success: true };
      } catch (error) {
        logger.error(`Failed to process email job ${job.id}:`, error);
        throw error;
      }
    });
  }

  /**
   * معالجات أحداث الـ Queue
   */
  private setupEventHandlers(): void {
    this.queue.on('completed', (job: Job<EmailJobData>) => {
      logger.info(
        `✅ Email job completed: ${job.id} - Type: ${job.data.type}`
      );
    });

    this.queue.on('failed', (job: Job<EmailJobData>, error: Error) => {
      logger.error(
        `❌ Email job failed after ${job.attemptsMade} attempts: ${job.id} - ${error.message}`
      );
    });

    this.queue.on('error', (error: Error) => {
      logger.error('Queue error:', error);
    });

    this.queue.on('stalled', (job: Job<EmailJobData>) => {
      logger.warn(`⏸️ Email job stalled: ${job.id}`);
    });
  }

  /**
   * تنظيف الـ Queue
   */
  async close(): Promise<void> {
    await this.queue.close();
    logger.info('Email queue closed');
  }

  /**
   * جلب حالة الـ Queue
   */
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.queue.count(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }
}

// Export singleton instance
let emailQueueInstance: EmailQueue | null = null;

export function getEmailQueue(): EmailQueue {
  if (!emailQueueInstance) {
    emailQueueInstance = new EmailQueue();
  }
  return emailQueueInstance;
}
