import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { AppError, ValidationError } from '../utils/errors.js';

interface BookingInvoiceData {
  bookingNumber: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  packageTitle: string;
  destination: string;
  tripStartDate: string;
  tripEndDate?: string;
  duration: number;
  persons: number;
  basePrice: number;
  pricePerPerson?: number;
  extras?: Array<{ name: string; price: number; quantity: number }>;
  totalPrice: number;
  tax?: number;
  discountApplied?: number;
  createdAt: Date;
  cancellationPolicy?: string;
  paymentMethod: string;
  companyDetails?: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
}

export class InvoiceService {
  private invoiceDir: string;

  constructor() {
    this.invoiceDir = path.join(process.cwd(), 'invoices');
    this.ensureInvoiceDir();
  }

  private ensureInvoiceDir(): void {
    if (!fs.existsSync(this.invoiceDir)) {
      fs.mkdirSync(this.invoiceDir, { recursive: true });
    }
  }

  async generateInvoice(bookingData: BookingInvoiceData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        doc.on('end', () => {
          resolve(Buffer.concat(chunks));
        });

        doc.on('error', reject);

        // Header
        doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', 50, 50);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Invoice #: ${bookingData.bookingNumber}`, 300, 50);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 300, 65);

        // Customer info
        doc.fontSize(12).font('Helvetica-Bold').text('Bill To:', 50, 130);
        doc.fontSize(10).font('Helvetica');
        doc.text(bookingData.guestName, 50, 150);
        doc.text(bookingData.guestEmail, 50, 165);
        doc.text(bookingData.guestPhone, 50, 180);

        // Trip details
        doc.fontSize(12).font('Helvetica-Bold').text('Trip Details', 50, 220);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Package: ${bookingData.packageTitle}`, 50, 240);
        doc.text(`Destination: ${bookingData.destination}`, 50, 255);
        doc.text(`Trip Date: ${new Date(bookingData.tripStartDate).toLocaleDateString()}`, 50, 270);
        doc.text(`Persons: ${bookingData.persons}`, 50, 285);

        // Totals
        const subtotal = bookingData.basePrice;
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 350, 350);
        if (bookingData.tax) {
          doc.text(`Tax: $${bookingData.tax.toFixed(2)}`, 350, 370);
        }
        doc.text(`TOTAL: $${bookingData.totalPrice.toFixed(2)}`, 350, 390);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async saveInvoiceToDisk(bookingNumber: string, pdfBuffer: Buffer): Promise<string> {
    if (!bookingNumber || !pdfBuffer) {
      throw new ValidationError('Booking number and PDF buffer are required');
    }

    const fileName = `Invoice_${bookingNumber}_${Date.now()}.pdf`;
    const filePath = path.join(this.invoiceDir, fileName);

    try {
      fs.writeFileSync(filePath, pdfBuffer);
      return filePath;
    } catch (error) {
      throw new AppError(500, 'Failed to save invoice');
    }
  }

  getInvoiceFromDisk(bookingNumber: string): Buffer | null {
    if (!bookingNumber) {
      throw new ValidationError('Booking number is required');
    }

    try {
      const files = fs.readdirSync(this.invoiceDir);
      const invoiceFile = files.find(f => f.includes(`Invoice_${bookingNumber}`));

      if (invoiceFile) {
        const filePath = path.join(this.invoiceDir, invoiceFile);
        return fs.readFileSync(filePath);
      }

      return null;
    } catch (error) {
      throw new AppError(500, 'Failed to retrieve invoice');
    }
  }

  async deleteInvoice(bookingNumber: string): Promise<void> {
    if (!bookingNumber) {
      throw new ValidationError('Booking number is required');
    }

    try {
      const files = fs.readdirSync(this.invoiceDir);
      const invoiceFile = files.find(f => f.includes(`Invoice_${bookingNumber}`));

      if (invoiceFile) {
        const filePath = path.join(this.invoiceDir, invoiceFile);
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      throw new AppError(500, 'Failed to delete invoice');
    }
  }

  generateInvoiceHTML(bookingData: BookingInvoiceData): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px;">
        <h1>Invoice #${bookingData.bookingNumber}</h1>
        <p><strong>Guest:</strong> ${bookingData.guestName}</p>
        <p><strong>Package:</strong> ${bookingData.packageTitle}</p>
        <p><strong>Destination:</strong> ${bookingData.destination}</p>
        <p><strong>Total Price:</strong> $${bookingData.totalPrice.toFixed(2)}</p>
        <p><strong>Payment Method:</strong> ${bookingData.paymentMethod}</p>
      </div>
    `;
  }

  async generateBookingInvoice(booking: any): Promise<Buffer> {
    try {
      console.log('📄 [InvoiceService.generateBookingInvoice] Generating invoice for booking:', booking.booking_number);

      const invoiceData: BookingInvoiceData = {
        bookingNumber: booking.booking_number,
        guestName: booking.user?.name || 'Guest',
        guestEmail: booking.user?.email || '',
        guestPhone: booking.user?.phone || '',
        packageTitle: booking.package?.title || 'Tour Package',
        destination: booking.package?.destination || 'Unknown',
        tripStartDate: booking.date_start,
        tripEndDate: booking.date_end,
        duration: booking.package?.duration_days || 1,
        persons: booking.persons,
        basePrice: Number(booking.total_price) || 0,
        totalPrice: Number(booking.total_price) || 0,
        createdAt: booking.created_at,
        paymentMethod: 'Online Payment',
      };

      console.log('📄 [InvoiceService.generateBookingInvoice] Invoice data prepared:', {
        bookingNumber: invoiceData.bookingNumber,
        guestName: invoiceData.guestName,
        totalPrice: invoiceData.totalPrice,
      });

      // Generate PDF
      const pdfBuffer = await this.generateInvoice(invoiceData);
      console.log('✅ [InvoiceService.generateBookingInvoice] PDF generated successfully, size:', pdfBuffer.length);
      return pdfBuffer;
    } catch (error) {
      console.error('❌ [InvoiceService.generateBookingInvoice] Error:', error);
      throw new AppError(500, 'Failed to generate invoice');
    }
  }
}
