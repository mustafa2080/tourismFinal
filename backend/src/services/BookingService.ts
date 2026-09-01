import { Repository } from 'typeorm';
import { Booking } from '../entities/Booking.js';
import { BookingExtra } from '../entities/BookingExtra.js';
import { Package } from '../entities/Package.js';
import { User } from '../entities/User.js';
import { BookingRepository } from '../repositories/BookingRepository.js';
import { NotFoundError, ValidationError, BookingError } from '../utils/errors.js';
import { dateUtils } from '../utils/dateUtils.js';
import { PriceCalculator } from '../utils/calculators/PriceCalculator.js';
import { BookingValidator } from '../utils/BookingValidator.js';
import { EmailService } from './EmailService.js';
import { InvoiceService } from './InvoiceService.js';
import { NotificationService } from './NotificationService.js';
import { getWebSocketService } from '../websocket/index.js';

export class BookingService {
  private bookingRepository: BookingRepository;
  private bookingExtraRepository: Repository<BookingExtra>;
  private emailService: EmailService;
  private invoiceService: InvoiceService;
  private packageRepository: Repository<Package>;
  private userRepository: Repository<User>;

  constructor(
    bookingRepo: Repository<Booking>,
    bookingExtraRepo?: Repository<BookingExtra>,
    packageRepo?: Repository<Package>,
    userRepo?: Repository<User>
  ) {
    this.bookingRepository = new BookingRepository(bookingRepo);
    this.bookingExtraRepository = bookingExtraRepo as Repository<BookingExtra>;
    this.emailService = new EmailService();
    this.invoiceService = new InvoiceService();
    this.packageRepository = packageRepo as Repository<Package>;
    this.userRepository = userRepo as Repository<User>;
  }

  /**
   * التحقق من قاعدة 15 يوم - CRITICAL BUSINESS RULE
   * الحجز يجب أن يكون قبل بداية الرحلة بـ 15 يوم على الأقل
   */
  private validateBookingDate(tripStartDate: Date): void {
    if (!dateUtils.isValidBookingDate(tripStartDate)) {
      const minDate = dateUtils.getMinimumBookingDate();
      throw new BookingError(
        `Trip booking must be at least 15 days in advance. ` +
        `Trip date must be after ${dateUtils.formatDate(minDate)}`
      );
    }
  }

  /**
   * توليد رقم حجز فريد
   */
  private generateBookingNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BK-${timestamp.slice(-6)}-${random}`;
  }

  /**
   * Create booking with complete validation, price calculation, and extras handling
   * ENHANCED VERSION with proper price calculation and extras support
   */
  async createBooking(
    userId: string,
    packageId: string,
    tripStartDate: Date,
    personBreakdown: { adults: number; children: number; seniors: number },
    extras: { key: string; name: string; price: number; quantity?: number }[],
    submittedTotalPrice: number,
    paymentType: string = 'on_arrival',
    notes?: string
  ): Promise<Booking> {
    console.log('🟢 [BookingService.createBooking] Starting booking creation...');
    
    // Step 1: Validate input
    console.log('   Step 1: Validating input data...');
    if (!userId || !packageId) {
      throw new ValidationError('User ID and Package ID are required');
    }

    const totalPersons = personBreakdown.adults + personBreakdown.children + personBreakdown.seniors;
    if (totalPersons < 1) {
      throw new ValidationError('At least 1 person is required');
    }

    // Step 2: Validate booking date (15-day rule)
    console.log('   Step 2: Validating 15-day booking rule...');
    this.validateBookingDate(tripStartDate);

    // Step 3: Get package details
    console.log('   Step 3: Fetching package details...');
    const pkg = await this.packageRepository?.findOne({ where: { id: packageId } });
    if (!pkg) {
      throw new NotFoundError('Package not found');
    }
    console.log(`   ✅ Package found: ${pkg.title}`);

    // Step 4: Calculate price on backend (security!)
    console.log('   Step 4: Calculating price on backend...');
    const basePrice = Number(pkg.base_price);
    const priceBreakdown = PriceCalculator.calculateTotalPrice({
      persons: totalPersons,
      basePrice,
      extras: extras || [],
      taxRate: 0.05, // 5% tax
    });

    console.log(`   Price calculation:`, {
      basePrice,
      baseSubtotal: priceBreakdown.baseSubtotal,
      extrasSubtotal: priceBreakdown.extrasSubtotal,
      subtotal: priceBreakdown.subtotal,
      tax: priceBreakdown.tax,
      calculatedTotal: priceBreakdown.total,
    });

    // Step 5: Verify price match (fraud prevention)
    console.log('   Step 5: Verifying price match...');
    if (!BookingValidator.verifyPriceMatch(priceBreakdown.total, submittedTotalPrice, 0.01)) {
      console.error('❌ Price mismatch detected!', {
        calculated: priceBreakdown.total,
        submitted: submittedTotalPrice,
        difference: Math.abs(priceBreakdown.total - submittedTotalPrice),
      });
      throw new ValidationError(
        'Price calculation mismatch. Please refresh and try again.'
      );
    }
    console.log('   ✅ Price verified');

    // Step 6: Generate unique booking number
    console.log('   Step 6: Generating booking number...');
    const bookingNumber = this.generateBookingNumber();
    console.log(`   ✅ Booking number: ${bookingNumber}`);

    // Step 7: Create booking record
    console.log('   Step 7: Creating booking record...');
    const booking = await this.bookingRepository.create({
      user_id: userId,
      package_id: packageId,
      booking_number: bookingNumber,
      status: 'confirmed',
      persons: totalPersons,
      date_start: tripStartDate,
      total_price: priceBreakdown.total,
      payment_type: paymentType as 'on_arrival' | 'deposit' | 'full_payment',
      notes: notes || null,
    });
    console.log(`   ✅ Booking created and AUTO-CONFIRMED: ${booking.id}`);

    // Step 8: Create booking extras
    console.log('   Step 8: Saving extras...');
    if (extras && extras.length > 0 && this.bookingExtraRepository) {
      for (const extra of extras) {
        try {
          const bookingExtra = this.bookingExtraRepository.create({
            booking_id: booking.id,
            extra_key: extra.key,
            extra_name: extra.name,
            price: extra.price,
            quantity: extra.quantity || 1,
          });
          await this.bookingExtraRepository.save(bookingExtra);
          console.log(`   ✅ Extra saved: ${extra.name}`);
        } catch (err) {
          console.error(`   ❌ Error saving extra ${extra.key}:`, err);
          throw new BookingError(`Failed to save extra: ${extra.name}`);
        }
      }
    }

    // Step 9: Send confirmation email and PDF
    console.log('   Step 9: Sending confirmation email...');
    try {
      await this.sendConfirmationEmailAndPDF(booking, userId, packageId, priceBreakdown);
    } catch (emailError) {
      console.error('   ⚠️ Failed to send confirmation email:', emailError);
      // Don't fail the booking if email fails
    }

    // Step 10: Create booking notification
    console.log('   Step 10: Creating booking notification...');
    try {
      const notificationService = new NotificationService();
      await notificationService.notifyBookingCreated(userId, {
        bookingNumber: booking.booking_number,
        packageTitle: pkg.title,
        tripDate: booking.date_start.toISOString(),
        totalPrice: booking.total_price,
        bookingId: booking.id, // Add booking ID for navigation
      });
      console.log(`✅ Booking notification created for user: ${userId}`);
    } catch (notifError) {
      console.error('   ⚠️ Failed to create booking notification:', notifError);
    }

    // Step 11: Send WebSocket notification
    console.log('   Step 11: Sending WebSocket notification...');
    try {
      const wsService = getWebSocketService();
      if (wsService) {
        wsService.notifyNewBooking(booking, userId);
      }
    } catch (wsError) {
      console.error('   ⚠️ Failed to send WebSocket notification:', wsError);
    }

    console.log('🎉 [BookingService.createBooking] Booking created successfully!\n');

    // Return booking with extras loaded
    return await this.bookingRepository.findById(booking.id) as Booking;
  }

  /**
   * Send confirmation email and generate PDF invoice
   * Updated to accept price breakdown
   */
  private async sendConfirmationEmailAndPDF(
    booking: Booking,
    userId: string,
    packageId: string,
    priceBreakdown?: any
  ): Promise<void> {
    try {
      // Fetch user data
      const user = await this.userRepository?.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Fetch package data
      const pkg = await this.packageRepository?.findOne({ where: { id: packageId } });
      if (!pkg) {
        throw new NotFoundError('Package not found');
      }

      console.log(`📧 Generating PDF invoice for booking ${booking.booking_number}...`);

      // Generate PDF invoice
      const pdfData = await this.invoiceService.generateInvoice({
        bookingNumber: booking.booking_number,
        guestName: user.name,
        guestEmail: user.email,
        guestPhone: user.phone || '',
        packageTitle: pkg.title,
        destination: pkg.destination,
        tripStartDate: booking.date_start.toISOString(),
        duration: (pkg as any).duration_days || 1,
        persons: booking.persons,
        basePrice: Number(pkg.base_price),
        totalPrice: Number(booking.total_price),
        createdAt: new Date(),
        paymentMethod: booking.payment_type,
      });

      // Send confirmation email with PDF attachment
      console.log(`📧 Sending confirmation email to ${user.email}...`);
      await this.emailService.sendBookingConfirmation(
        booking,
        user.email,
        pkg.title
      );

      console.log(`✅ Confirmation email sent to ${user.email}`);
      console.log(`✅ Invoice PDF generated for booking ${booking.booking_number}`);
    } catch (error) {
      console.error('⚠️ Error in sendConfirmationEmailAndPDF:', error);
      // Don't throw - we don't want to fail the booking if email fails
    }
  }

  /**
   * جلب الحجز برقمه
   */
  async getBookingByNumber(bookingNumber: string): Promise<Booking> {
    const booking = await this.bookingRepository.findByBookingNumber(bookingNumber);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }
    return booking;
  }

  /**
   * جلب حجوزات المستخدم
   */
  async getUserBookings(userId: string): Promise<Booking[]> {
    return await this.bookingRepository.findUserBookings(userId);
  }

  /**
   * تحديث حالة الحجز
   */
  async updateBookingStatus(
    bookingId: string,
    newStatus: 'confirmed' | 'completed' | 'cancelled'
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    const updated = await this.bookingRepository.update(bookingId, {
      status: newStatus,
    }) as Booking;

    // 📧 إرسال بريد تحديث الحالة
    try {
      const user = await this.userRepository?.findOne({ where: { id: booking.user_id } });
      const pkg = await this.packageRepository?.findOne({ where: { id: booking.package_id } });
      
      if (user && pkg) {
        await this.emailService.sendStatusChange(
          user.email,
          booking.booking_number,
          newStatus,
          pkg.title
        );
        console.log(`✅ Status change email sent to ${user.email}`);
      }
    } catch (emailError) {
      console.error('Failed to send status change email:', emailError);
    }

    // 🔌 إرسال إخطار فوري عبر WebSocket
    try {
      const wsService = getWebSocketService();
      if (wsService && newStatus === 'confirmed') {
        wsService.notifyBookingConfirmed(updated, booking.user_id);
      }
    } catch (wsError) {
      console.error('Failed to send WebSocket confirmation:', wsError);
    }

    return updated;
  }

  /**
   * الحصول على الحجوزات القادمة
   */
  async getUpcomingBookings(daysAhead: number = 7): Promise<Booking[]> {
    return await this.bookingRepository.findUpcomingBookings(daysAhead);
  }

  /**
   * إلغاء الحجز
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<Booking> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.status === 'cancelled') {
      throw new BookingError('Booking is already cancelled');
    }

    if (booking.status === 'completed') {
      throw new BookingError('Cannot cancel a completed booking');
    }

    // تحديث حالة الحجز لـ cancelled
    const updated = await this.bookingRepository.update(bookingId, {
      status: 'cancelled',
      notes: reason || booking.notes,
    }) as Booking;

    // 📧 إرسال بريد تأكيد الإلغاء
    try {
      const user = await this.userRepository?.findOne({ where: { id: booking.user_id } });
      const pkg = await this.packageRepository?.findOne({ where: { id: booking.package_id } });
      
      if (user && pkg) {
        await this.emailService.sendCancellationConfirmation(
          user.email,
          booking.booking_number,
          pkg.title
        );
        console.log(`✅ Cancellation confirmation email sent to ${user.email}`);
      }
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
    }

    // 🔌 إرسال إخطار الإلغاء عبر WebSocket
    try {
      const wsService = getWebSocketService();
      if (wsService) {
        wsService.notifyBookingCancelled(updated, booking.user_id);
      }
    } catch (wsError) {
      console.error('Failed to send WebSocket cancellation:', wsError);
    }

    return updated;
  }

  /**
   * جلب الحجوزات حسب الحالة
   */
  async getBookingsByStatus(status: string): Promise<Booking[]> {
    return await this.bookingRepository.findByStatus(status);
  }

  /**
   * عد حجوزات الرحلة
   */
  async countPackageBookings(packageId: string): Promise<number> {
    return await this.bookingRepository.countByPackage(packageId);
  }
}
