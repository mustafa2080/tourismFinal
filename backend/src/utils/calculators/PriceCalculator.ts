/**
 * PriceCalculator.ts
 * 
 * Handles all price calculations for bookings
 * - Base price calculation
 * - Extras/add-ons calculation
 * - Tax calculation
 * - Total price calculation
 * 
 * ⚠️ SECURITY: Always recalculate on backend - never trust frontend prices!
 */

export interface PriceBreakdown {
  basePrice: number;
  baseSubtotal: number;
  extrasSubtotal: number;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  breakdown: {
    item: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
}

export interface BookingPriceData {
  persons: number;
  basePrice: number;
  extras?: {
    key: string;
    name: string;
    price: number;
    quantity?: number;
  }[];
  taxRate?: number; // Default: 0.05 (5%)
  currency?: string; // Default: 'USD'
  childDiscount?: number; // Default: 0 (no discount)
  seniorDiscount?: number; // Default: 0 (no discount)
}

export class PriceCalculator {
  private static readonly DEFAULT_TAX_RATE = 0.05; // 5%
  private static readonly DEFAULT_CURRENCY = 'USD';
  private static readonly PRECISION = 2; // 2 decimal places

  /**
   * Calculate complete price breakdown for a booking
   * @param data - Booking price data
   * @returns Complete price breakdown
   */
  static calculateTotalPrice(data: BookingPriceData): PriceBreakdown {
    if (!data || data.persons < 1) {
      throw new Error('Invalid booking data: persons must be at least 1');
    }

    if (data.basePrice < 0) {
      throw new Error('Invalid booking data: base price cannot be negative');
    }

    const taxRate = data.taxRate ?? this.DEFAULT_TAX_RATE;
    const currency = data.currency ?? this.DEFAULT_CURRENCY;

    // Step 1: Calculate base cost (base price × persons)
    const baseSubtotal = this.round(data.basePrice * data.persons);

    // Step 2: Calculate extras cost
    const extrasArray = data.extras || [];
    let extrasSubtotal = 0;
    const breakdownItems: PriceBreakdown['breakdown'] = [];

    // Add base price to breakdown
    breakdownItems.push({
      item: `Base Price (${data.persons} ${data.persons === 1 ? 'person' : 'persons'})`,
      quantity: data.persons,
      unitPrice: data.basePrice,
      subtotal: baseSubtotal,
    });

    // Calculate each extra
    for (const extra of extrasArray) {
      if (extra.price < 0) {
        throw new Error(`Invalid extra: ${extra.key} has negative price`);
      }

      const qty = extra.quantity || 1;
      const extraCost = this.round(extra.price * qty);
      extrasSubtotal = this.round(extrasSubtotal + extraCost);

      breakdownItems.push({
        item: extra.name,
        quantity: qty,
        unitPrice: extra.price,
        subtotal: extraCost,
      });
    }

    // Step 3: Calculate subtotal (before tax)
    const subtotal = this.round(baseSubtotal + extrasSubtotal);

    // Step 4: Calculate tax
    const tax = this.round(subtotal * taxRate);

    // Step 5: Calculate total
    const total = this.round(subtotal + tax);

    // Step 6: Add tax line to breakdown
    breakdownItems.push({
      item: `Tax (${(taxRate * 100).toFixed(1)}%)`,
      quantity: 1,
      unitPrice: tax,
      subtotal: tax,
    });

    return {
      basePrice: this.round(data.basePrice),
      baseSubtotal,
      extrasSubtotal,
      subtotal,
      tax,
      total,
      currency,
      breakdown: breakdownItems,
    };
  }

  /**
   * Verify that frontend price matches backend calculation
   * Used for security - prevent price manipulation
   * 
   * @param calculatedPrice - Backend calculated total
   * @param frontendPrice - Price submitted by frontend
   * @param tolerance - Acceptable difference (default: 0.01)
   * @returns true if prices match within tolerance
   */
  static verifyPrice(
    calculatedPrice: number,
    frontendPrice: number,
    tolerance: number = 0.01
  ): boolean {
    return Math.abs(this.round(calculatedPrice - frontendPrice)) <= tolerance;
  }

  /**
   * Calculate base price per person (for display)
   */
  static getBasePricePerPerson(
    totalPrice: number,
    persons: number,
    extrasTotal: number = 0
  ): number {
    if (persons <= 0) {
      return 0;
    }
    return this.round((totalPrice - extrasTotal) / persons);
  }

  /**
   * Calculate price for N persons (simple)
   */
  static calculateBasePrice(basePrice: number, persons: number): number {
    return this.round(basePrice * persons);
  }

  /**
   * Apply discount to price
   */
  static applyDiscount(price: number, discountPercent: number): number {
    if (discountPercent < 0 || discountPercent > 100) {
      throw new Error('Discount must be between 0 and 100');
    }
    return this.round(price * (1 - discountPercent / 100));
  }

  /**
   * Calculate tax amount
   */
  static calculateTax(subtotal: number, taxRate: number = this.DEFAULT_TAX_RATE): number {
    if (taxRate < 0 || taxRate > 1) {
      throw new Error('Tax rate must be between 0 and 1');
    }
    return this.round(subtotal * taxRate);
  }

  /**
   * Round to specified decimal places
   * @private
   */
  private static round(value: number, decimals: number = this.PRECISION): number {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  /**
   * Format price for display
   */
  static formatPrice(price: number, currency: string = 'USD'): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(price);
  }

  /**
   * Get localized price (for different regions)
   */
  static getLocalizedPrice(
    price: number,
    locale: string = 'en-US',
    currency: string = 'USD'
  ): string {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(price);
  }
}

export default PriceCalculator;