/**
 * BookingValidator.ts
 * 
 * Comprehensive validation for booking requests
 * - Request data validation
 * - Business rule enforcement
 * - Email/Phone validation
 * - Date validation (15-day rule)
 * - Price validation
 */

import { ValidationError } from './errors.js';
import { dateUtils } from './dateUtils.js';
import { PriceCalculator } from './calculators/PriceCalculator.js';

export interface CreateBookingRequest {
  packageId?: string;
  tripStartDate?: string | Date;
  persons?: {
    adults?: number;
    children?: number;
    seniors?: number;
  };
  extras?: {
    key: string;
    name: string;
    price: number;
    quantity?: number;
  }[];
  totalPrice?: number;
  paymentType?: string;
  notes?: string;
  displayCurrency?: 'USD' | 'EGP';
  // User info (for guest checkout)
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

export interface ValidatedBookingData {
  packageId: string;
  tripStartDate: Date;
  totalPersons: number;
  personBreakdown: {
    adults: number;
    children: number;
    seniors: number;
  };
  extras: {
    key: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalPrice: number;
  paymentType: 'on_arrival' | 'deposit' | 'full_payment';
  notes: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
}

export class BookingValidator {
  /**
   * Validate complete booking request
   */
  static validateBookingRequest(data: CreateBookingRequest): ValidatedBookingData {
    // 1. Validate required fields
    this.validateRequiredFields(data);

    // 2. Validate package ID
    const packageId = this.validatePackageId(data.packageId);

    // 3. Validate trip date (15-day rule)
    const tripStartDate = this.validateTripDate(data.tripStartDate);

    // 4. Validate persons
    const personBreakdown = this.validatePersons(data.persons);
    const totalPersons = personBreakdown.adults + personBreakdown.children + personBreakdown.seniors;

    // 5. Validate extras
    const extras = this.validateExtras(data.extras || []);

    // 6. Validate total price
    const totalPrice = this.validateTotalPrice(data.totalPrice);

    // 7. Validate payment type
    const paymentType = this.validatePaymentType(data.paymentType);

    // 8. Validate payment type is valid for the price (only on_arrival for $1-$100)
    this.validatePaymentTypeForPrice(paymentType, totalPrice);

    // 9. Validate notes (optional)
    const notes = this.validateNotes(data.notes);

    // 10. Validate guest info if provided
    const guestName = this.validateGuestName(data.guestName);
    const guestEmail = this.validateEmail(data.guestEmail);
    const guestPhone = this.validatePhone(data.guestPhone);

    return {
      packageId,
      tripStartDate,
      totalPersons,
      personBreakdown,
      extras,
      totalPrice,
      paymentType,
      notes,
      guestName,
      guestEmail,
      guestPhone,
    };
  }

  /**
   * Validate required fields
   */
  private static validateRequiredFields(data: CreateBookingRequest): void {
    if (!data) {
      throw new ValidationError('Booking data is required');
    }

    if (!data.packageId) {
      throw new ValidationError('Package ID is required');
    }

    if (!data.tripStartDate) {
      throw new ValidationError('Trip start date is required');
    }

    if (!data.persons) {
      throw new ValidationError('Number of persons is required');
    }

    if (data.totalPrice === undefined || data.totalPrice === null) {
      throw new ValidationError('Total price is required');
    }
  }

  /**
   * Validate package ID
   */
  private static validatePackageId(packageId?: string): string {
    if (!packageId || typeof packageId !== 'string' || !packageId.trim()) {
      throw new ValidationError('Invalid package ID');
    }

    // UUID validation (basic)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(packageId.trim())) {
      throw new ValidationError('Package ID must be a valid UUID');
    }

    return packageId.trim();
  }

  /**
   * Validate trip date (15-day rule)
   */
  private static validateTripDate(tripStartDate?: string | Date): Date {
    if (!tripStartDate) {
      throw new ValidationError('Trip start date is required');
    }

    let date: Date;
    try {
      date = typeof tripStartDate === 'string' 
        ? new Date(tripStartDate)
        : tripStartDate;

      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
    } catch (e) {
      throw new ValidationError('Invalid trip start date format');
    }

    // Validate 15-day rule
    if (!dateUtils.isValidBookingDate(date)) {
      const minDate = dateUtils.getMinimumBookingDate();
      throw new ValidationError(
        `Trip must be at least 15 days in advance. ` +
        `Minimum date: ${dateUtils.formatDate(minDate)}`
      );
    }

    return date;
  }

  /**
   * Validate persons breakdown
   */
  private static validatePersons(
    persons?: { adults?: number; children?: number; seniors?: number }
  ): { adults: number; children: number; seniors: number } {
    if (!persons) {
      throw new ValidationError('Person information is required');
    }

    const adults = Number(persons.adults) || 0;
    const children = Number(persons.children) || 0;
    const seniors = Number(persons.seniors) || 0;

    if (adults < 0 || children < 0 || seniors < 0) {
      throw new ValidationError('Person counts cannot be negative');
    }

    const total = adults + children + seniors;
    if (total < 1) {
      throw new ValidationError('At least 1 person is required for booking');
    }

    if (total > 50) {
      throw new ValidationError('Group size cannot exceed 50 persons');
    }

    return { adults, children, seniors };
  }

  /**
   * Validate extras
   */
  private static validateExtras(
    extras: any[]
  ): { key: string; name: string; price: number; quantity: number }[] {
    if (!Array.isArray(extras)) {
      throw new ValidationError('Extras must be an array');
    }

    const validatedExtras = extras
      .filter(extra => extra && typeof extra === 'object')
      .map((extra, index) => {
        if (!extra.key || typeof extra.key !== 'string') {
          throw new ValidationError(`Extra ${index + 1}: key is required`);
        }

        if (!extra.name || typeof extra.name !== 'string') {
          throw new ValidationError(`Extra ${index + 1}: name is required`);
        }

        if (extra.price === undefined || extra.price === null) {
          throw new ValidationError(`Extra ${index + 1}: price is required`);
        }

        const price = Number(extra.price);
        if (isNaN(price) || price < 0) {
          throw new ValidationError(`Extra ${index + 1}: price must be a positive number`);
        }

        const quantity = Math.max(1, Number(extra.quantity) || 1);
        if (!Number.isInteger(quantity) || quantity < 1) {
          throw new ValidationError(`Extra ${index + 1}: quantity must be a positive integer`);
        }

        return {
          key: extra.key.trim(),
          name: extra.name.trim(),
          price,
          quantity,
        };
      });

    // Validate no duplicate extras
    const keys = validatedExtras.map(e => e.key);
    const uniqueKeys = new Set(keys);
    if (keys.length !== uniqueKeys.size) {
      throw new ValidationError('Duplicate extras are not allowed');
    }

    return validatedExtras;
  }

  /**
   * Validate total price
   */
  private static validateTotalPrice(totalPrice?: number): number {
    if (totalPrice === undefined || totalPrice === null) {
      throw new ValidationError('Total price is required');
    }

    const price = Number(totalPrice);
    if (isNaN(price)) {
      throw new ValidationError('Total price must be a number');
    }

    if (price <= 0) {
      throw new ValidationError('Total price must be greater than 0');
    }

    if (price > 999999) {
      throw new ValidationError('Total price exceeds maximum allowed');
    }

    return PriceCalculator['round'](price);
  }

  /**
   * Validate payment type
   */
  private static validatePaymentType(paymentType?: string): 'on_arrival' | 'deposit' | 'full_payment' {
    const validTypes = ['on_arrival', 'deposit', 'full_payment'];
    const type = (paymentType || 'on_arrival').toLowerCase().trim();

    if (!validTypes.includes(type)) {
      throw new ValidationError(
        `Invalid payment type. Must be one of: ${validTypes.join(', ')}`
      );
    }

    return type as 'on_arrival' | 'deposit' | 'full_payment';
  }

  /**
   * Validate notes (optional)
   */
  private static validateNotes(notes?: string): string {
    if (!notes) {
      return '';
    }

    if (typeof notes !== 'string') {
      throw new ValidationError('Notes must be a string');
    }

    const trimmed = notes.trim();
    if (trimmed.length > 1000) {
      throw new ValidationError('Notes cannot exceed 1000 characters');
    }

    return trimmed;
  }

  /**
   * Validate guest name
   */
  private static validateGuestName(name?: string): string {
    if (!name) {
      return '';
    }

    if (typeof name !== 'string') {
      throw new ValidationError('Guest name must be a string');
    }

    const trimmed = name.trim();
    if (trimmed.length < 2) {
      throw new ValidationError('Guest name must be at least 2 characters');
    }

    if (trimmed.length > 100) {
      throw new ValidationError('Guest name cannot exceed 100 characters');
    }

    // Check for invalid characters
    if (!/^[a-zA-Z\s'-]+$/i.test(trimmed)) {
      throw new ValidationError('Guest name contains invalid characters');
    }

    return trimmed;
  }

  /**
   * Validate email address
   */
  static validateEmail(email?: string): string {
    if (!email) {
      return '';
    }

    if (typeof email !== 'string') {
      throw new ValidationError('Email must be a string');
    }

    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed)) {
      throw new ValidationError('Invalid email address');
    }

    if (trimmed.length > 254) {
      throw new ValidationError('Email address too long');
    }

    return trimmed;
  }

  /**
   * Validate phone number
   */
  static validatePhone(phone?: string): string {
    if (!phone) {
      return '';
    }

    if (typeof phone !== 'string') {
      throw new ValidationError('Phone must be a string');
    }

    const trimmed = phone.trim();
    // Allow common phone formats: +20 123 456 7890, 01234567890, etc.
    const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/;

    if (!phoneRegex.test(trimmed)) {
      throw new ValidationError('Invalid phone number format');
    }

    if (trimmed.length > 20) {
      throw new ValidationError('Phone number too long');
    }

    return trimmed;
  }

  /**
   * Validate payment type is valid for the price
   * Rule: For prices $1-$100, all payment types are allowed
   * Rule: For prices > $100, only card payments allowed (deposit, full_payment) - no on_arrival
   */
  private static validatePaymentTypeForPrice(paymentType: string, totalPrice: number): void {
    // If price is > $100, only allow card payments (deposit, full_payment)
    if (totalPrice > 100) {
      if (paymentType === 'on_arrival') {
        throw new ValidationError(
          `"Pay on Arrival" is not available for bookings over $100. ` +
          `Only card payment methods are available (50% Deposit or Full Payment). ` +
          `Your total is $${totalPrice.toFixed(2)}.`
        );
      }
    }
    // For prices $1-$100, all payment types are allowed (no validation needed)
  }

  /**
   * Verify frontend price matches backend calculation
   */
  static verifyPriceMatch(
    calculatedPrice: number,
    submittedPrice: number,
    tolerance: number = 0.01
  ): boolean {
    return PriceCalculator.verifyPrice(calculatedPrice, submittedPrice, tolerance);
  }
}