/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/connection.js';
import { Booking } from '../entities/Booking.js';
import { AppError, ValidationError } from '../utils/errors.js';
import { EmailService } from '../services/EmailService.js';
import { logger } from '../middleware/logger.js';

export class RefundController {
  private emailService = new EmailService();

  /**
   * POST /api/admin/bookings/:bookingId/refund
   * معالجة استرجاع المبلغ
   * يدعم جميع أنواع الدفع:
   * - on_arrival: لا يتم استرجاع لأن العميل لم يدفع بعد
   * - deposit: يتم استرجاع الدفعة المقدمة
   * - full_payment: يتم استرجاع المبلغ كاملاً
   */
  async issueRefund(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingId } = req.params;
      const adminId = (req as any).user?.userId;
      const { refundAmount, refundReason, notes } = req.body;

      console.log('💰 [RefundController.issueRefund] Processing refund:', {
        bookingId,
        refundAmount,
        paymentType: req.body.paymentType,
        adminId,
      });

      if (!refundAmount || refundAmount <= 0) {
        throw new ValidationError('Refund amount must be greater than 0');
      }

      if (!refundReason) {
        throw new ValidationError('Refund reason is required');
      }

      const bookingRepository = AppDataSource.getRepository(Booking);
      const booking = await bookingRepository.findOne({
        where: { id: bookingId },
        relations: ['user'],
      });

      if (!booking) {
        throw new AppError(404, 'Booking not found');
      }

      // Check payment type for refund eligibility
      console.log('📋 [RefundController.issueRefund] Payment type:', booking.payment_type);

      // على_arrival: لا استرجاع (العميل لم يدفع)
      if ((booking.payment_type as string) === 'on_arrival') {
        console.log('ℹ️  [RefundController.issueRefund] Payment on arrival - no refund needed');
        throw new AppError(
          400,
          'No refund needed for "Pay on Arrival" bookings. Payment will be canceled and not collected.'
        );
      }

      // deposit أو full_payment: تحقق من المبلغ
      if (refundAmount > booking.total_price) {
        throw new ValidationError(
          `Refund amount cannot exceed booking total (${booking.total_price})`
        );
      }

      // تحديث الـ booking
      booking.refund_amount = refundAmount;
      booking.refund_reason = refundReason;
      booking.refund_status = 'approved';
      booking.refund_processed_at = new Date();
      booking.refund_processed_by = adminId;
      booking.refund_notes = notes;

      await bookingRepository.save(booking);

      console.log('✅ [RefundController.issueRefund] Refund approved:', booking.id);

      // إرسال بريد للمستخدم
      try {
        const refundMessage =
          (booking.payment_type as string) === 'on_arrival'
            ? 'Your booking has been canceled. No payment will be collected.'
            : `Your refund of $${refundAmount} has been approved and will be processed within 5-7 business days.`;

        await this.emailService.sendRefundApprovedEmail(
          booking.user?.email || '',
          booking.booking_number,
          refundAmount,
          refundReason
        );
      } catch (error) {
        logger.error('Failed to send refund email:', error);
      }

      res.status(200).json({
        success: true,
        message: 'Refund processed successfully',
        data: {
          bookingId: booking.id,
          bookingNumber: booking.booking_number,
          paymentType: booking.payment_type,
          refundAmount:
            (booking.payment_type as string) === 'on_arrival' ? 0 : refundAmount,
          refundStatus: booking.refund_status,
          processedAt: booking.refund_processed_at,
          note:
            (booking.payment_type as string) === 'on_arrival'
              ? 'Payment on arrival - booking canceled, no refund issued'
              : `Refund of $${refundAmount} will be processed`,
        },
      });
    } catch (error) {
      console.error('❌ [RefundController.issueRefund] Error:', error);
      next(error);
    }
  }

  /**
   * PUT /api/admin/bookings/:bookingId/refund/status
   * تحديث حالة الاسترجاع
   */
  async updateRefundStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingId } = req.params;
      const { status, notes } = req.body;

      const validStatuses = ['pending', 'approved', 'rejected', 'completed'];
      if (!validStatuses.includes(status)) {
        throw new ValidationError(
          `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        );
      }

      const bookingRepository = AppDataSource.getRepository(Booking);
      const booking = await bookingRepository.findOne({ where: { id: bookingId } });

      if (!booking) {
        throw new AppError(404, 'Booking not found');
      }

      booking.refund_status = status as any;
      if (notes) booking.refund_notes = notes;

      await bookingRepository.save(booking);

      res.status(200).json({
        success: true,
        message: 'Refund status updated successfully',
        data: {
          bookingId: booking.id,
          refundStatus: booking.refund_status,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/bookings/for-refund
   * جلب جميع الحجوزات المؤهلة للاسترجاع (bookings available for refund)
   */
  async getBookingsForRefund(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);
      const status = req.query.status as string | undefined;

      const bookingRepository = AppDataSource.getRepository(Booking);

      let query = bookingRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.user', 'user')
        .leftJoinAndSelect('booking.package', 'package');

      if (status) {
        query = query.andWhere('booking.status = :status', { status });
      } else {
        // Show confirmed and completed bookings (available for refund)
        query = query.andWhere('booking.status IN (:...statuses)', { 
          statuses: ['confirmed', 'completed'] 
        });
      }

      const [bookings, total] = await query
        .orderBy('booking.created_at', 'DESC')
        .take(limit)
        .skip(offset)
        .getManyAndCount();

      res.status(200).json({
        success: true,
        data: bookings.map((b) => ({
          id: b.id,
          booking_id: b.id,
          booking_number: b.booking_number,
          amount: b.total_price,
          refunded_amount: b.refund_amount || 0,
          reason: b.refund_reason,
          status: b.refund_status || 'pending',
          payment_type: b.payment_type,
          booking_status: b.status,
          created_at: b.created_at,
          booking: {
            booking_number: b.booking_number,
            total_price: b.total_price,
            payment_type: b.payment_type,
            status: b.status,
            user: b.user
              ? {
                  name: b.user.name,
                  email: b.user.email,
                  fullName: b.user.name,
                }
              : null,
            package: b.package
              ? {
                  title: b.package.title,
                }
              : null,
          },
        })),
        pagination: {
          limit,
          offset,
          total,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/refunds/stats
   * إحصائيات الاسترجاع
   */
  async getRefundStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookingRepository = AppDataSource.getRepository(Booking);

      const totalRefunded = await bookingRepository
        .createQueryBuilder('booking')
        .select('SUM(booking.refund_amount)', 'total')
        .where('booking.refund_amount > 0')
        .getRawOne();

      const refundsByStatus = await bookingRepository
        .createQueryBuilder('booking')
        .select('booking.refund_status', 'status')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(booking.refund_amount)', 'totalAmount')
        .where('booking.refund_amount > 0')
        .groupBy('booking.refund_status')
        .getRawMany();

      // تحويل البيانات لصيغة مناسبة
      const stats = {
        totalRefunds: refundsByStatus.reduce((sum, item) => sum + parseInt(item.count || 0), 0),
        totalAmount: totalRefunded?.total || 0,
        approvalRate: 0,
        pendingRefunds: 0,
        approvedRefunds: 0,
        rejectedRefunds: 0,
        processedRefunds: 0,
      };

      refundsByStatus.forEach((item) => {
        switch (item.status) {
          case 'pending':
            stats.pendingRefunds = parseInt(item.count || 0);
            break;
          case 'approved':
            stats.approvedRefunds = parseInt(item.count || 0);
            break;
          case 'rejected':
            stats.rejectedRefunds = parseInt(item.count || 0);
            break;
          case 'processed':
            stats.processedRefunds = parseInt(item.count || 0);
            break;
        }
      });

      // حساب نسبة الموافقة
      if (stats.totalRefunds > 0) {
        stats.approvalRate = Math.round((stats.approvedRefunds / stats.totalRefunds) * 100);
      }

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/bookings/:bookingId/refund/reject
   * رفض طلب الاسترجاع
   */
  async rejectRefund(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        throw new ValidationError('Rejection reason is required');
      }

      const bookingRepository = AppDataSource.getRepository(Booking);
      const booking = await bookingRepository.findOne({ where: { id: bookingId } });

      if (!booking) {
        throw new AppError(404, 'Booking not found');
      }

      booking.refund_status = 'rejected';
      booking.refund_notes = reason;

      await bookingRepository.save(booking);

      res.status(200).json({
        success: true,
        message: 'Refund request rejected',
        data: {
          bookingId: booking.id,
          refundStatus: booking.refund_status,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/refunds
   * جلب جميع الحجوزات التي تم استرجاع المبلغ لها
   */
  async getRefunds(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
      const offset = Math.max(0, parseInt(req.query.offset as string) || 0);
      const status = req.query.status as string | undefined;

      const bookingRepository = AppDataSource.getRepository(Booking);

      let query = bookingRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.user', 'user')
        .leftJoinAndSelect('booking.package', 'package')
        .where('booking.refund_amount > 0');

      if (status) {
        query = query.andWhere('booking.refund_status = :status', { status });
      }

      const [bookings, total] = await query
        .orderBy('booking.refund_processed_at', 'DESC')
        .take(limit)
        .skip(offset)
        .getManyAndCount();

      res.status(200).json({
        success: true,
        data: bookings.map((b) => ({
          id: b.id,
          booking_id: b.id,
          booking_number: b.booking_number,
          amount: b.refund_amount,
          reason: b.refund_reason,
          status: b.refund_status,
          paymentType: b.payment_type,
          created_at: b.created_at,
          booking: {
            booking_number: b.booking_number,
            total_price: b.total_price,
            payment_type: b.payment_type,
            user: b.user
              ? {
                  name: b.user.name,
                  email: b.user.email,
                  fullName: b.user.name,
                }
              : null,
            package: b.package
              ? {
                  title: b.package.title,
                }
              : null,
          },
        })),
        pagination: {
          limit,
          offset,
          total,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
