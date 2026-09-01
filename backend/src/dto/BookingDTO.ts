/**
 * BookingDTO.ts
 * 
 * Data Transfer Objects (DTOs) for Booking API responses
 * Standardizes response format across all booking endpoints
 */

export class BookingExtraDTO {
  id: string;
  booking_id: string;
  extra_key: string;
  extra_name: string;
  price: string;
  quantity: number;
  created_at: Date;

  constructor(data: any) {
    this.id = data.id;
    this.booking_id = data.booking_id;
    this.extra_key = data.extra_key;
    this.extra_name = data.extra_name;
    this.price = String(data.price);
    this.quantity = data.quantity || 1;
    this.created_at = data.created_at;
  }
}

export class BookingResponseDTO {
  id: string;
  booking_number: string;
  user_id: string;
  package_id: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  persons: number;
  date_start: string; // ISO date format
  date_end: string; // ISO date format
  total_price: string;
  payment_type: 'on_arrival' | 'deposit' | 'full_payment';
  notes: string | null;
  invoice_url: string | null;
  created_at: Date;
  updated_at: Date;
  extras?: BookingExtraDTO[];

  constructor(data: any) {
    this.id = data.id;
    this.booking_number = data.booking_number;
    this.user_id = data.user_id;
    this.package_id = data.package_id;
    this.status = data.status;
    this.persons = data.persons;
    
    // Handle date_start properly
    try {
      const startDate = new Date(data.date_start);
      this.date_start = !isNaN(startDate.getTime()) 
        ? startDate.toISOString().split('T')[0]
        : data.date_start;
    } catch (e) {
      this.date_start = data.date_start;
    }

    // Handle date_end properly (if available)
    try {
      const endDate = new Date(data.date_end || data.trip_end_date);
      this.date_end = !isNaN(endDate.getTime()) 
        ? endDate.toISOString().split('T')[0]
        : data.date_end;
    } catch (e) {
      this.date_end = data.date_end || data.trip_end_date;
    }

    this.total_price = String(data.total_price);
    this.payment_type = data.payment_type;
    this.notes = data.notes || null;
    this.invoice_url = data.invoice_url || null;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    
    if (data.extras && Array.isArray(data.extras)) {
      this.extras = data.extras.map((e: any) => new BookingExtraDTO(e));
    }
  }
}

export class BookingDetailedDTO extends BookingResponseDTO {
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  package?: {
    id: string;
    title: string;
    destination: string;
    duration_days: number;
    base_price: string;
  };

  constructor(data: any) {
    super(data);
    
    if (data.user) {
      this.user = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
      };
    }

    if (data.package) {
      this.package = {
        id: data.package.id,
        title: data.package.title,
        destination: data.package.destination,
        duration_days: data.package.duration_days,
        base_price: String(data.package.base_price),
      };

      // Calculate date_end from date_start + duration_days
      try {
        if (this.date_start && data.package.duration_days) {
          const startDate = new Date(this.date_start);
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + data.package.duration_days - 1);
          this.date_end = endDate.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error('Error calculating end date:', e);
      }
    }
  }
}

export class CreateBookingResponseDTO {
  success: boolean;
  message: string;
  data: BookingDetailedDTO;
  confirmationSent: {
    email: boolean;
    whatsapp: boolean;
  };

  constructor(
    booking: any,
    message: string = 'Booking created successfully',
    confirmationSent?: { email?: boolean; whatsapp?: boolean }
  ) {
    this.success = true;
    this.message = message;
    this.data = new BookingDetailedDTO(booking);
    this.confirmationSent = {
      email: confirmationSent?.email ?? true,
      whatsapp: confirmationSent?.whatsapp ?? false,
    };
  }
}

export class BookingListDTO {
  data: BookingDetailedDTO[];
  count: number;
  total?: number;
  page?: number;
  pageSize?: number;

  constructor(
    bookings: any[],
    total?: number,
    page?: number,
    pageSize?: number
  ) {
    this.data = bookings.map(b => new BookingDetailedDTO(b));
    this.count = bookings.length;
    this.total = total;
    this.page = page;
    this.pageSize = pageSize;
  }
}

export class BookingStatusUpdateDTO {
  success: boolean;
  message: string;
  data: BookingResponseDTO;
  statusChangedFrom: string;
  statusChangedTo: string;

  constructor(booking: any, oldStatus: string) {
    this.success = true;
    this.message = `Booking status updated successfully`;
    this.data = new BookingResponseDTO(booking);
    this.statusChangedFrom = oldStatus;
    this.statusChangedTo = booking.status;
  }
}

export class BookingCancellationDTO {
  success: boolean;
  message: string;
  data: BookingResponseDTO;
  refundInfo?: {
    refundAmount: string;
    refundReason: string;
    estimatedRefundDate: string;
  };

  constructor(booking: any, refundInfo?: any) {
    this.success = true;
    this.message = 'Booking cancelled successfully';
    this.data = new BookingResponseDTO(booking);
    
    if (refundInfo) {
      this.refundInfo = {
        refundAmount: String(refundInfo.amount),
        refundReason: refundInfo.reason || 'User requested cancellation',
        estimatedRefundDate: refundInfo.estimatedDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }
  }
}

export class PriceBreakdownDTO {
  basePrice: string;
  baseSubtotal: string;
  extrasSubtotal: string;
  subtotal: string;
  tax: string;
  total: string;
  currency: string;
  breakdown: {
    item: string;
    quantity: number;
    unitPrice: string;
    subtotal: string;
  }[];

  constructor(priceData: any) {
    this.basePrice = String(priceData.basePrice);
    this.baseSubtotal = String(priceData.baseSubtotal);
    this.extrasSubtotal = String(priceData.extrasSubtotal);
    this.subtotal = String(priceData.subtotal);
    this.tax = String(priceData.tax);
    this.total = String(priceData.total);
    this.currency = priceData.currency;
    this.breakdown = priceData.breakdown.map((item: any) => ({
      item: item.item,
      quantity: item.quantity,
      unitPrice: String(item.unitPrice),
      subtotal: String(item.subtotal),
    }));
  }
}

export class BookingValidationErrorDTO {
  success: boolean;
  error: {
    message: string;
    code: string;
    details?: string;
    validationErrors?: {
      field: string;
      message: string;
    }[];
  };

  constructor(message: string, code: string, details?: string, validationErrors?: any[]) {
    this.success = false;
    this.error = {
      message,
      code,
      details,
      validationErrors,
    };
  }
}

export class BookingConfirmationDTO {
  booking: BookingResponseDTO;
  priceBreakdown: PriceBreakdownDTO;
  nextSteps: string[];
  importantDates: {
    tripStartDate: string;
    cancellationDeadline: string;
    confirmationDeadline: string;
  };

  constructor(booking: any, priceBreakdown: any) {
    this.booking = new BookingResponseDTO(booking);
    this.priceBreakdown = new PriceBreakdownDTO(priceBreakdown);
    
    const tripDate = new Date(booking.date_start);
    const now = new Date();
    const cancellationDate = new Date(tripDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days before
    const confirmationDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now

    this.importantDates = {
      tripStartDate: tripDate.toISOString().split('T')[0],
      cancellationDeadline: cancellationDate.toISOString().split('T')[0],
      confirmationDeadline: confirmationDate.toISOString().split('T')[0],
    };

    this.nextSteps = [
      'Download your booking confirmation email',
      'Review your itinerary and package details',
      'Confirm your booking within 3 days (optional)',
      'Prepare required documents for the trip',
      'Contact us 7 days before the trip to finalize details',
    ];
  }
}