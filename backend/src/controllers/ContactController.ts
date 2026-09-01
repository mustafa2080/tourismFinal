/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/connection.js';
import { ContactSubmission } from '../entities/ContactSubmission.js';
import { ContactService } from '../services/ContactService.js';
import { AppError } from '../utils/errors.js';

export class ContactController {
  private contactService: ContactService;

  constructor() {
    const contactRepository = AppDataSource.getRepository(ContactSubmission);
    this.contactService = new ContactService(contactRepository);
  }

  /**
   * POST /api/contact
   * إرسال رسالة تواصل
   */
  async submitContactForm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, phone, subject, message } = req.body;

      const submission = await this.contactService.submitContactForm({
        name,
        email,
        phone,
        subject,
        message,
      });

      res.status(201).json({
        success: true,
        message: 'Contact form submitted successfully. We will get back to you soon.',
        data: {
          id: submission.id,
          status: submission.status,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/contact
   * جلب جميع الرسائل (للـ admin)
   */
  async getAllSubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

      const result = await this.contactService.getAllSubmissions(limit, offset);

      res.status(200).json({
        success: true,
        data: result.submissions,
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
   * GET /api/admin/contact/:id
   * جلب رسالة تواصل بـ ID
   */
  async getSubmissionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const submission = await this.contactService.getSubmissionById(id);

      res.status(200).json({
        success: true,
        data: submission,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/contact/:id/status
   * تحديث حالة الرسالة
   */
  async updateSubmissionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;

      const submission = await this.contactService.updateSubmissionStatus(id, status, adminNotes);

      res.status(200).json({
        success: true,
        message: 'Contact submission status updated',
        data: submission,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/contact/status/:status
   * جلب الرسائل حسب الـ status
   */
  async getSubmissionsByStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.params;
      const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);

      const submissions = await this.contactService.getSubmissionsByStatus(status, limit, offset);

      res.status(200).json({
        success: true,
        data: submissions,
        count: submissions.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/contact/stats/pending
   * عد الرسائل المعلقة
   */
  async getPendingCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const count = await this.contactService.getPendingCount();

      res.status(200).json({
        success: true,
        data: { pendingCount: count },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/admin/contact/:id
   * حذف رسالة تواصل
   */
  async deleteSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await this.contactService.deleteSubmission(id);

      res.status(200).json({
        success: true,
        message: 'Contact submission deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
