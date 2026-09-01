/// <reference types="express" />
import { Repository } from 'typeorm';
import { ContactSubmission } from '../entities/ContactSubmission.js';
import { ContactSubmissionRepository } from '../repositories/ContactSubmissionRepository.js';
import { EmailService } from './EmailService.js';
import { NotificationService } from './NotificationService.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import { AppDataSource } from '../config/connection.js';

export class ContactService {
  private contactRepository: ContactSubmissionRepository;
  private emailService: EmailService;
  private notificationService: NotificationService;

  constructor(contactRepo: Repository<ContactSubmission>) {
    this.contactRepository = new ContactSubmissionRepository(contactRepo);
    this.emailService = new EmailService();
    this.notificationService = new NotificationService();
  }

  /**
   * إرسال رسالة تواصل
   */
  async submitContactForm(data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }): Promise<ContactSubmission> {
    // التحقق من البيانات
    if (!data.name || !data.email || !data.subject || !data.message) {
      throw new ValidationError('Name, email, subject, and message are required');
    }

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new ValidationError('Invalid email address');
    }

    // حفظ الرسالة
    const submission = await this.contactRepository.create(data);

    // البحث عن admin users
    const adminUsers = await AppDataSource.getRepository('User').find({
      where: { role: 'admin' },
    });

    // إرسال بريد إلكتروني للـ admin
    try {
      await this.emailService.sendContactNotificationToAdmin(
        data.name,
        data.email,
        data.subject,
        data.message,
        data.phone
      );
    } catch (error) {
      console.error('Failed to send admin notification email:', error);
    }

    // 🔔 إرسال إشعار للمستخدم بأن رسالته تم استقبالها
    try {
      const userRepo = AppDataSource.getRepository('User');
      const user = await userRepo.findOne({ where: { email: data.email } });
      if (user) {
        await this.notificationService.createNotification(
          user.id,
          'general',
          'تم استقبال رسالتك ✅',
          `شكراً لتواصلك معنا ${data.name}. تم استقبال رسالتك وسيتم الرد عليك في أقرب وقت.`,
          {
            contactId: submission.id,
            subject: data.subject,
          }
        );
        console.log(`✅ Contact confirmation notification sent to user: ${user.id}`);
      }
    } catch (error) {
      console.error('Failed to send user confirmation notification:', error);
    }

    // إرسال إشعارات للـ admin users
    try {
      for (const admin of adminUsers) {
        await this.notificationService.notifyAdmin(admin.id, {
          type: 'New Contact Message',
          message: `New contact message from ${data.name} (${data.email}): "${data.subject}"`,
          actionUrl: `/admin/contact/${submission.id}`,
          data: {
            contactId: submission.id,
            senderName: data.name,
            senderEmail: data.email,
            subject: data.subject,
          }
        });
      }
    } catch (error) {
      console.error('Failed to send admin notifications:', error);
    }

    // إرسال تأكيد للمستخدم
    try {
      await this.emailService.sendContactConfirmationToUser(data.name, data.email);
    } catch (error) {
      console.error('Failed to send user confirmation email:', error);
    }

    return submission;
  }

  /**
   * جلب جميع الرسائل (للـ admin)
   */
  async getAllSubmissions(
    limit: number = 20,
    offset: number = 0
  ): Promise<{ submissions: ContactSubmission[]; total: number }> {
    return await this.contactRepository.findAllPaginated(limit, offset);
  }

  /**
   * جلب رسالة بـ ID
   */
  async getSubmissionById(id: string): Promise<ContactSubmission> {
    if (!id) {
      throw new ValidationError('Submission ID is required');
    }

    const submission = await this.contactRepository.findById(id);
    if (!submission) {
      throw new NotFoundError('Contact submission not found');
    }

    return submission;
  }

  /**
   * تحديث حالة الرسالة والـ admin notes
   */
  async updateSubmissionStatus(
    id: string,
    status: 'pending' | 'read' | 'responded',
    adminNotes?: string
  ): Promise<ContactSubmission> {
    if (!id || !status) {
      throw new ValidationError('Submission ID and status are required');
    }

    const validStatuses = ['pending', 'read', 'responded'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError('Invalid status');
    }

    return await this.contactRepository.updateStatus(id, status, adminNotes);
  }

  /**
   * جلب الرسائل حسب الـ status
   */
  async getSubmissionsByStatus(
    status: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<ContactSubmission[]> {
    const validStatuses = ['pending', 'read', 'responded'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError('Invalid status');
    }

    return await this.contactRepository.findByStatus(status, limit, offset);
  }

  /**
   * عد الرسائل المعلقة
   */
  async getPendingCount(): Promise<number> {
    return await this.contactRepository.countPending();
  }

  /**
   * حذف رسالة تواصل
   */
  async deleteSubmission(id: string): Promise<void> {
    if (!id) {
      throw new ValidationError('Submission ID is required');
    }

    const submission = await this.contactRepository.findById(id);
    if (!submission) {
      throw new NotFoundError('Contact submission not found');
    }

    await this.contactRepository.deleteById(id);
  }
}
