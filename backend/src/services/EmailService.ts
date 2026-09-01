import nodemailer from 'nodemailer';
import { AppError } from '../utils/errors.js';

interface BookingData {
  bookingNumber: string;
  guestName: string;
  guestEmail: string;
  packageTitle: string;
  destination: string;
  tripStartDate: string;
  tripEndDate?: string;
  totalPrice: number;
  persons: number;
  extras?: { name: string; price: number }[];
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter based on environment
    const emailProvider = process.env.EMAIL_PROVIDER || 'smtp';

    if (emailProvider === 'sendgrid') {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY || '',
        },
      });
    } else {
      // Default SMTP configuration
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASSWORD || '',
        },
      });
    }
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(email: string, userName: string): Promise<void> {
    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
            <h1 style="color: #333;">Welcome to Travel Packages! 🌍</h1>
            <p style="color: #666; font-size: 16px;">Hi ${userName},</p>
            <p style="color: #666; font-size: 16px;">
              Thank you for joining our travel community! We're excited to help you discover amazing destinations around the world.
            </p>
            <p style="color: #666; font-size: 16px;">
              Start exploring our packages and book your next adventure today!
            </p>
            <a href="${process.env.FRONTEND_URL}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
              Start Exploring
            </a>
            <p style="color: #999; font-size: 14px; margin-top: 40px;">
              If you have any questions, feel free to contact us at ${process.env.ADMIN_EMAIL}
            </p>
          </div>
        </div>
      `;

      await this.transporter.sendMail({
        from: process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_USER,
        to: email,
        subject: 'Welcome to Travel Packages Platform!',
        html: htmlContent,
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new AppError(500, 'Failed to send welcome email');
    }
  }

  /**
   * Send booking confirmation email ⭐ Important
   */
  async sendBookingConfirmation(booking: any, email: string, packageTitle: string): Promise<void> {
    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
            <h1 style="color: #28a745;">✓ Booking Confirmed!</h1>
            <p style="color: #666; font-size: 16px;">Thank you for booking with us!</p>
            <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin: 20px 0;">
              <p><strong>Booking Number:</strong> ${booking.booking_number}</p>
              <p><strong>Package:</strong> ${packageTitle}</p>
              <p><strong>Total Price:</strong> $${booking.total_price}</p>
            </div>
          </div>
        </div>
      `;

      await this.transporter.sendMail({
        from: process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_USER,
        to: email,
        subject: `Booking Confirmation - ${booking.booking_number}`,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Error sending booking confirmation:', error);
      throw new AppError(500, 'Failed to send booking confirmation');
    }
  }

  /**
   * Send status change email
   */
  async sendStatusChange(email: string, bookingNumber: string, status: string, packageTitle: string): Promise<void> {
    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
            <h1>Booking Status Updated</h1>
            <p>Your booking status has been updated to: <strong>${status}</strong></p>
            <p><strong>Booking:</strong> ${bookingNumber}</p>
            <p><strong>Package:</strong> ${packageTitle}</p>
          </div>
        </div>
      `;

      await this.transporter.sendMail({
        from: process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_USER,
        to: email,
        subject: `Booking Status Update - ${bookingNumber}`,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Error sending status change email:', error);
      throw new AppError(500, 'Failed to send status change email');
    }
  }

  /**
   * Send booking reminder email
   */
  async sendBookingReminder(
    email: string,
    daysRemaining: number
  ): Promise<void> {
    try {
      const reminderMessage =
        daysRemaining === 1
          ? 'Your amazing trip is tomorrow!'
          : `Your trip starts in ${daysRemaining} days.`;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
            <h1 style="color: #ff9800;">⏰ Trip Reminder</h1>
            <p style="color: #666; font-size: 16px;">${reminderMessage}</p>
          </div>
        </div>
      `;

      await this.transporter.sendMail({
        from: process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_USER,
        to: email,
        subject: `Trip Reminder - ${daysRemaining} days remaining`,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Error sending booking reminder:', error);
      throw new AppError(500, 'Failed to send booking reminder');
    }
  }

  /**
   * Send cancellation confirmation email
   */
  async sendCancellationConfirmation(
    email: string,
    bookingNumber: string,
    packageTitle: string
  ): Promise<void> {
    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
            <h1 style="color: #dc3545;">Booking Cancelled</h1>
            <p style="color: #666; font-size: 16px;">Your booking has been successfully cancelled.</p>
            <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin: 20px 0;">
              <p><strong>Booking Number:</strong> ${bookingNumber}</p>
              <p><strong>Package:</strong> ${packageTitle}</p>
            </div>
          </div>
        </div>
      `;

      await this.transporter.sendMail({
        from: process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_USER,
        to: email,
        subject: `Cancellation Confirmed - ${bookingNumber}`,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Error sending cancellation confirmation:', error);
      throw new AppError(500, 'Failed to send cancellation confirmation');
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string, resetLink: string, userName: string): Promise<void> {
    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
            <h1 style="color: #333;">Reset Your Password</h1>
            
            <p style="color: #666; font-size: 16px;">Hi ${userName},</p>
            <p style="color: #666; font-size: 16px;">
              We received a request to reset your password. Click the button below to create a new password.
            </p>

            <p style="color: #999; font-size: 14px;">
              This link will expire in 1 hour.
            </p>

            <a href="${resetLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
              Reset Password
            </a>

            <p style="color: #666; font-size: 14px;">
              Or copy and paste this link in your browser:<br/>
              <code style="background-color: #f0f0f0; padding: 10px; border-radius: 3px; word-break: break-all;">
                ${resetLink}
              </code>
            </p>

            <p style="color: #dc3545; font-size: 14px;">
              If you didn't request a password reset, please ignore this email or contact us immediately.
            </p>

            <p style="color: #999; font-size: 12px; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px;">
              © ${new Date().getFullYear()} Travel Packages Platform. All rights reserved.
            </p>
          </div>
        </div>
      `;

      await this.transporter.sendMail({
        from: process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_USER,
        to: email,
        subject: 'Reset Your Password',
        html: htmlContent,
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new AppError(500, 'Failed to send password reset email');
    }
  }

  /**
   * Send contact form reply
   */
  async sendContactReply(email: string, message: string, subject: string): Promise<void> {
    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
            <h1 style="color: #333;">Thank You for Contacting Us</h1>
            
            <p style="color: #666; font-size: 16px;">
              We have received your message and will get back to you as soon as possible.
            </p>

            <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin: 20px 0;">
              <h2 style="color: #333;">Your Message</h2>
              <p style="color: #666; white-space: pre-wrap;">${message}</p>
            </div>

            <p style="color: #999; font-size: 12px; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px;">
              © ${new Date().getFullYear()} Travel Packages Platform. All rights reserved.
            </p>
          </div>
        </div>
      `;

      await this.transporter.sendMail({
        from: process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_USER,
        to: email,
        subject: `Re: ${subject}`,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Error sending contact reply:', error);
      throw new AppError(500, 'Failed to send contact reply');
    }
  }

  /**
   * Send invoice as attachment
   */
  async sendInvoice(
    email: string,
    bookingData: BookingData,
    pdfBuffer: Buffer
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_USER,
        to: email,
        subject: `Invoice - ${bookingData.bookingNumber}`,
        text: `Please find attached your invoice for booking ${bookingData.bookingNumber}`,
        attachments: [
          {
            filename: `Invoice_${bookingData.bookingNumber}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });
    } catch (error) {
      console.error('Error sending invoice:', error);
      throw new AppError(500, 'Failed to send invoice');
    }
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready to send emails');
      return true;
    } catch (error) {
      console.error('❌ Email service error:', error);
      return false;
    }
  }

  /**
   * إرسال تذكير قبل الرحلة
   */
  async sendReminderEmail(email: string, subject: string, message: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@tourplatform.com',
        to: email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Trip Reminder</h2>
            ${message.split('\n').map((line) => `<p>${line}</p>`).join('')}
          </div>
        `,
      });
    } catch (error) {
      console.error('Error sending reminder email:', error);
      throw error;
    }
  }

  /**
   * إرسال رسالة تأكيد التواصل
   */
  async sendContactConfirmationToUser(name: string, email: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@tourplatform.com',
        to: email,
        subject: 'We received your message',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Thank you for contacting us, ${name}!</h2>
            <p>We have received your message and will get back to you as soon as possible.</p>
            <p>Best regards,<br>Tour Platform Team</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Error sending contact confirmation:', error);
      throw error;
    }
  }

  /**
   * إرسال بريد بموافقة الاسترجاع
   */
  async sendRefundApprovedEmail(
    email: string,
    bookingNumber: string,
    refundAmount: number,
    refundReason: string
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@tourplatform.com',
        to: email,
        subject: `Refund Approved - Booking ${bookingNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Refund Approved</h2>
            <p>Your refund has been approved!</p>
            <p><strong>Booking Number:</strong> ${bookingNumber}</p>
            <p><strong>Refund Amount:</strong> ${refundAmount.toFixed(2)}</p>
            <p><strong>Reason:</strong> ${refundReason}</p>
            <p>The refund will be processed to your original payment method within 5-7 business days.</p>
            <p>Best regards,<br>Tour Platform Team</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Error sending refund email:', error);
      throw error;
    }
  }

  /**
   * إرسال إخطار للـ admin برسالة تواصل جديدة
   */
  async sendContactNotificationToAdmin(
    name: string,
    email: string,
    subject: string,
    message: string,
    phone?: string
  ): Promise<void> {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@tourplatform.com';
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@tourplatform.com',
        to: adminEmail,
        subject: `New Contact Form Submission: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Error sending admin notification:', error);
      throw error;
    }
  }
}
