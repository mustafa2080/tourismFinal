/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/connection.js';
import { BookingExtra } from '../entities/BookingExtra.js';
import { Booking } from '../entities/Booking.js';
import { AppError, ValidationError } from '../utils/errors.js';

export class BookingExtraController {
  /**
   * GET /api/bookings/:bookingId/extras
   * جلب extras خاص بـ booking معين
   */
  async getBookingExtras(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingId } = req.params;

      const extraRepository = AppDataSource.getRepository(BookingExtra);
      const extras = await extraRepository.find({
        where: { booking_id: bookingId },
      });

      res.status(200).json({
        success: true,
        data: extras,
        count: extras.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/bookings/:bookingId/extras
   * إضافة extra إلى الـ booking
   */
  async addBookingExtra(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingId } = req.params;
      const { extra_key, extra_name, price, quantity = 1 } = req.body;

      // التحقق من البيانات
      if (!extra_key || !extra_name || price === undefined) {
        throw new ValidationError('extra_key, extra_name, and price are required');
      }

      if (price < 0) {
        throw new ValidationError('Price cannot be negative');
      }

      // التحقق من وجود الـ booking
      const bookingRepository = AppDataSource.getRepository(Booking);
      const booking = await bookingRepository.findOne({ where: { id: bookingId } });
      if (!booking) {
        throw new AppError(404, 'Booking not found');
      }

      // إنشاء الـ extra
      const extraRepository = AppDataSource.getRepository(BookingExtra);
      const extra = extraRepository.create({
        booking_id: bookingId,
        extra_key,
        extra_name,
        price,
        quantity,
      });

      await extraRepository.save(extra);

      // تحديث الـ total_price للـ booking
      await this.updateBookingTotalPrice(bookingId);

      res.status(201).json({
        success: true,
        message: 'Extra added successfully',
        data: extra,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/bookings/extras/:extraId
   * تحديث extra
   */
  async updateBookingExtra(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { extraId } = req.params;
      const { extra_name, price, quantity } = req.body;

      const extraRepository = AppDataSource.getRepository(BookingExtra);
      const extra = await extraRepository.findOne({ where: { id: extraId } });
      if (!extra) {
        throw new AppError(404, 'Extra not found');
      }

      // تحديث البيانات
      if (extra_name) extra.extra_name = extra_name;
      if (price !== undefined) {
        if (price < 0) {
          throw new ValidationError('Price cannot be negative');
        }
        extra.price = price;
      }
      if (quantity) extra.quantity = quantity;

      await extraRepository.save(extra);

      // تحديث الـ total_price للـ booking
      await this.updateBookingTotalPrice(extra.booking_id);

      res.status(200).json({
        success: true,
        message: 'Extra updated successfully',
        data: extra,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/bookings/extras/:extraId
   * حذف extra
   */
  async deleteBookingExtra(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { extraId } = req.params;

      const extraRepository = AppDataSource.getRepository(BookingExtra);
      const extra = await extraRepository.findOne({ where: { id: extraId } });
      if (!extra) {
        throw new AppError(404, 'Extra not found');
      }

      const bookingId = extra.booking_id;
      await extraRepository.delete(extraId);

      // تحديث الـ total_price للـ booking
      await this.updateBookingTotalPrice(bookingId);

      res.status(200).json({
        success: true,
        message: 'Extra deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Helper: تحديث الـ total_price للـ booking
   */
  private async updateBookingTotalPrice(bookingId: string): Promise<void> {
    try {
      const bookingRepository = AppDataSource.getRepository(Booking);
      const extraRepository = AppDataSource.getRepository(BookingExtra);

      const booking = await bookingRepository.findOne({ where: { id: bookingId } });
      if (!booking) return;

      // حساب base price (عدد الأشخاص × سعر الـ package)
      let totalPrice = booking.persons * parseFloat(booking.package?.base_price?.toString() || '0');

      // إضافة extras
      const extras = await extraRepository.find({ where: { booking_id: bookingId } });
      for (const extra of extras) {
        totalPrice += parseFloat(extra.price.toString()) * extra.quantity;
      }

      booking.total_price = totalPrice;
      await bookingRepository.save(booking);
    } catch (error) {
      console.error('Error updating booking total price:', error);
    }
  }

  /**
   * GET /api/packages/:packageId/price-options
   * جلب خيارات السعر المتاحة للـ package
   */
  async getPackagePriceOptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { packageId } = req.params;

      // هذه بيانات تجريبية - في الواقع يجب تخزينها في DB
      const priceOptions = {
        roomTypes: [
          { key: 'single', name: 'Single Room', price: 0 },
          { key: 'double', name: 'Double Room', price: 50 },
          { key: 'suite', name: 'Suite', price: 150 },
        ],
        ageGroups: [
          { key: 'adult', name: 'Adult', price: 0 },
          { key: 'child', name: 'Child (6-12)', price: -100 },
          { key: 'infant', name: 'Infant (0-5)', price: -150 },
        ],
        extras: [
          { key: 'private_transfer', name: 'Private Transfer', price: 75 },
          { key: 'guide', name: 'Private Guide', price: 100 },
          { key: 'travel_insurance', name: 'Travel Insurance', price: 25 },
          { key: 'meal_plan', name: 'Full Meal Plan', price: 150 },
          { key: 'vip_access', name: 'VIP Access', price: 200 },
        ],
      };

      res.status(200).json({
        success: true,
        data: priceOptions,
      });
    } catch (error) {
      next(error);
    }
  }
}
