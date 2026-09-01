import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/connection.js';
import { Booking } from '../entities/Booking.js';
import { BookingExtra } from '../entities/BookingExtra.js';
import { Package } from '../entities/Package.js';
import { User } from '../entities/User.js';
import { BookingService } from '../services/BookingService.js';
import { BookingValidator, CreateBookingRequest } from '../utils/BookingValidator.js';
import { PriceCalculator } from '../utils/calculators/PriceCalculator.js';
import {
  CreateBookingResponseDTO,
  BookingResponseDTO,
  BookingDetailedDTO,
  BookingListDTO,
  BookingStatusUpdateDTO,
  BookingCancellationDTO,
  PriceBreakdownDTO,
  BookingValidationErrorDTO,
  BookingConfirmationDTO,
} from '../dto/BookingDTO.js';
import { AppError, ValidationError } from '../utils/errors.js';

export class BookingController {
  private bookingService: BookingService;
  private bookingRepository = AppDataSource.getRepository(Booking);
  private bookingExtraRepository = AppDataSource.getRepository(BookingExtra);
  private packageRepository = AppDataSource.getRepository(Package);
  private userRepository = AppDataSource.getRepository(User);

  constructor() {
    this.bookingService = new BookingService(
      this.bookingRepository,
      this.bookingExtraRepository,
      this.packageRepository,
      this.userRepository
    );
  }

  /**
   * CREATE BOOKING - Enhanced with validation, price calculation, and extras
   */
  async createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('📨 [BookingController.createBooking] Request received');
      
      if (!req.user) {
        throw new AppError(401, 'Unauthorized - User must be logged in');
      }

      const userId = req.user.userId;
      const requestData: CreateBookingRequest = req.body;

      console.log('📋 Request data:', {
        packageId: requestData.packageId,
        tripStartDate: requestData.tripStartDate,
        persons: requestData.persons,
        extrasCount: requestData.extras?.length || 0,
        totalPrice: requestData.totalPrice,
      });

      // Step 1: Validate request
      console.log('Step 1: Validating request...');
      let validatedData;
      try {
        validatedData = BookingValidator.validateBookingRequest(requestData);
      } catch (validationError) {
        const errorDto = new BookingValidationErrorDTO(
          (validationError as any).message,
          'VALIDATION_ERROR'
        );
        res.status(400).json(errorDto);
        return;
      }

      console.log('✅ Request validation passed');

      // Step 2: Create booking via service
      console.log('Step 2: Creating booking via service...');
      const booking = await this.bookingService.createBooking(
        userId,
        validatedData.packageId,
        validatedData.tripStartDate,
        validatedData.personBreakdown,
        validatedData.extras,
        validatedData.totalPrice,
        validatedData.paymentType,
        validatedData.notes
      );

      console.log('✅ Booking created successfully:', booking.booking_number);

      // Step 3: Fetch complete booking with relations
      console.log('Step 3: Fetching complete booking...');
      const completeBooking = await this.bookingRepository.findOne({
        where: { id: booking.id },
        relations: ['user', 'package', 'extras'],
      });

      // Step 4: Calculate price breakdown for response
      console.log('Step 4: Calculating price breakdown for response...');
      const priceBreakdown = PriceCalculator.calculateTotalPrice({
        persons: validatedData.totalPersons,
        basePrice: Number((completeBooking?.package?.base_price || 0)),
        extras: validatedData.extras,
      });

      // Step 5: Return response
      const responseDto = new CreateBookingResponseDTO(
        completeBooking,
        'Booking created successfully. Confirmation email has been sent.'
      );

      console.log('🎉 [BookingController.createBooking] Success!');
      res.status(201).json({
        success: true,
        message: responseDto.message,
        data: responseDto.data,
        priceBreakdown: new PriceBreakdownDTO(priceBreakdown),
        confirmationSent: responseDto.confirmationSent,
      });
    } catch (error) {
      console.error('❌ [BookingController.createBooking] Error:', error);
      next(error);
    }
  }

  /**
   * GET BOOKING - By ID or booking number
   */
  async getBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      const booking = await this.bookingRepository.findOne({
        where: [
          { id },
          { booking_number: id }
        ],
        relations: ['user', 'package', 'extras'],
      });

      if (!booking) {
        throw new AppError(404, 'Booking not found');
      }

      // Check authorization - user can only view their own bookings
      if (booking.user_id !== req.user.userId && req.user.role !== 'admin') {
        throw new AppError(403, 'You do not have permission to view this booking');
      }

      res.status(200).json({
        success: true,
        data: new BookingDetailedDTO(booking),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET USER BOOKINGS - All bookings for logged-in user
   */
  async getUserBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      console.log('📋 [getUserBookings] Fetching bookings for user:', req.user.userId);

      const bookings = await this.bookingRepository.find({
        where: { user_id: req.user.userId },
        relations: ['package', 'extras'],
        order: { created_at: 'DESC' },
      });

      console.log('✅ [getUserBookings] Found bookings:', bookings.length);

      if (bookings.length > 0) {
        console.log('📦 Sample booking details:', {
          id: bookings[0].id,
          booking_number: bookings[0].booking_number,
          status: bookings[0].status,
          total_price: bookings[0].total_price,
          persons: bookings[0].persons,
          date_start: bookings[0].date_start,
          package_id: bookings[0].package_id,
          package_title: bookings[0].package?.title,
          package_destination: bookings[0].package?.destination,
          package_duration: bookings[0].package?.duration_days,
          has_package: !!bookings[0].package,
        });
      }

      const bookingList = new BookingListDTO(bookings);

      console.log('📤 [getUserBookings] Returning response with:', {
        count: bookingList.count,
        first_booking_has_package: !!bookingList.data[0]?.package,
        first_booking_destination: bookingList.data[0]?.package?.destination,
      });
      
      res.status(200).json({
        success: true,
        data: bookingList.data,
        count: bookingList.count,
      });
    } catch (error) {
      console.error('❌ [getUserBookings] Error:', error);
      next(error);
    }
  }

  /**
   * UPDATE BOOKING STATUS - Admin only
   */
  async updateBookingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!req.user || req.user.role !== 'admin') {
        throw new AppError(403, 'Admin access required');
      }

      if (!status) {
        throw new ValidationError('Status is required');
      }

      const validStatuses = ['confirmed', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')}`);
      }

      const booking = await this.bookingRepository.findOne({
        where: { id },
        relations: ['user', 'package'],
      });

      if (!booking) {
        throw new AppError(404, 'Booking not found');
      }

      const oldStatus = booking.status;
      const updated = await this.bookingService.updateBookingStatus(id, status);

      res.status(200).json({
        success: true,
        message: `Booking status updated from ${oldStatus} to ${status}`,
        data: new BookingStatusUpdateDTO(updated, oldStatus),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * COMPLETE TRIP - User marks their trip as completed
   * Allows user to mark booking as completed so they can leave a review
   */
  async completeTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      const { id } = req.params;

      const booking = await this.bookingRepository.findOne({
        where: { id },
        relations: ['user', 'package'],
      });

      if (!booking) {
        throw new AppError(404, 'Booking not found');
      }

      // Only the booking owner can mark their trip as completed
      if (booking.user_id !== userId) {
        throw new AppError(403, 'You can only mark your own bookings as completed');
      }

      // Only update if not already completed
      if (booking.status === 'completed') {
        console.log(`ℹ️ [BookingController.completeTrip] Booking already completed: ${id}`);
        
        res.status(200).json({
          success: true,
          message: 'Trip is already marked as completed. You can leave a review.',
          data: new BookingStatusUpdateDTO(booking, 'completed'),
        });
        return;
      }

      // For cancelled bookings, just return success - allow review anyway
      if (booking.status === 'cancelled') {
        console.log(`ℹ️ [BookingController.completeTrip] Allowing review for cancelled booking: ${id}`);
        
        res.status(200).json({
          success: true,
          message: 'You can now leave a review for this trip.',
          data: new BookingStatusUpdateDTO(booking, 'cancelled'),
        });
        return;
      }

      // Update confirmed booking to completed
      const oldStatus = booking.status;
      const updated = await this.bookingService.updateBookingStatus(id, 'completed');

      console.log(`✅ [BookingController.completeTrip] Trip marked as completed for booking ${id}`);

      res.status(200).json({
        success: true,
        message: 'Trip marked as completed. You can now leave a review.',
        data: new BookingStatusUpdateDTO(updated, oldStatus),
      });
    } catch (error) {
      console.error('❌ [BookingController.completeTrip] Error:', error);
      next(error);
    }
  }

  /**
   * CANCEL BOOKING - User or Admin
   */
  async cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      const booking = await this.bookingRepository.findOne({ where: { id } });

      if (!booking) {
        throw new AppError(404, 'Booking not found');
      }

      // Check authorization
      if (booking.user_id !== req.user.userId && req.user.role !== 'admin') {
        throw new AppError(403, 'You can only cancel your own bookings');
      }

      const cancelled = await this.bookingService.cancelBooking(id, reason);

      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        data: new BookingCancellationDTO(cancelled),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET UPCOMING BOOKINGS - Admin only
   */
  async getUpcomingBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw new AppError(403, 'Admin access required');
      }

      const daysAhead = parseInt(req.query.daysAhead as string) || 7;
      const bookings = await this.bookingService.getUpcomingBookings(daysAhead);

      res.status(200).json({
        success: true,
        message: `Upcoming bookings for next ${daysAhead} days`,
        data: new BookingListDTO(bookings),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET BOOKINGS BY STATUS - Admin only
   */
  async getBookingsByStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw new AppError(403, 'Admin access required');
      }

      const { status } = req.params;
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

      if (!validStatuses.includes(status)) {
        throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')}`);
      }

      const bookings = await this.bookingService.getBookingsByStatus(status);

      res.status(200).json({
        success: true,
        data: new BookingListDTO(bookings),
        count: bookings.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * COUNT PACKAGE BOOKINGS
   */
  async countPackageBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { packageId } = req.params;

      const count = await this.bookingService.countPackageBookings(packageId);

      res.status(200).json({
        success: true,
        data: {
          packageId,
          totalBookings: count,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET BOOKING INVOICE - Download invoice as PDF
   */
  async getBookingInvoice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      console.log('📄 [BookingController.getBookingInvoice] Generating invoice for booking:', id);

      if (!userId) {
        throw new AppError(401, 'Authentication required');
      }

      // Fetch booking
      const booking = await this.bookingRepository.findOne({
        where: { id },
        relations: ['package', 'user', 'extras'],
      });

      if (!booking) {
        throw new AppError(404, 'Booking not found');
      }

      // Check if user owns this booking or is admin
      if (booking.user_id !== userId && req.user?.role !== 'admin') {
        throw new AppError(403, 'Not authorized to access this booking');
      }

      console.log('📄 [BookingController.getBookingInvoice] Booking found, generating PDF...');

      // Generate PDF invoice
      const { InvoiceService } = await import('../services/InvoiceService.js');
      const invoicePDF = await new InvoiceService().generateBookingInvoice(booking);

      console.log('📄 [BookingController.getBookingInvoice] PDF generated, size:', invoicePDF.length, 'bytes');

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${booking.booking_number}.pdf"`);
      res.setHeader('Content-Length', invoicePDF.length);

      res.send(invoicePDF);
    } catch (error) {
      console.error('❌ [BookingController.getBookingInvoice] Error:', error);
      next(error);
    }
  }

  /**
   * CALCULATE PRICE - Preview price before booking
   * Used by frontend to show real-time price calculation
   */
  async calculatePrice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { packageId, persons, extras } = req.body;

      if (!packageId || !persons) {
        throw new ValidationError('packageId and persons are required');
      }

      const pkg = await this.packageRepository.findOne({ where: { id: packageId } });
      if (!pkg) {
        throw new AppError(404, 'Package not found');
      }

      const priceBreakdown = PriceCalculator.calculateTotalPrice({
        persons: persons.adults + (persons.children || 0) + (persons.seniors || 0),
        basePrice: Number(pkg.base_price),
        extras: extras || [],
      });

      res.status(200).json({
        success: true,
        data: new PriceBreakdownDTO(priceBreakdown),
      });
    } catch (error) {
      next(error);
    }
  }
}

export default BookingController;