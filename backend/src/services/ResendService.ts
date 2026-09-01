import { Resend } from 'resend';
import { AppError } from '../utils/errors.js';

export class ResendService {
  private resend: Resend;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new AppError(500, 'RESEND_API_KEY is not configured');
    }
    this.resend = new Resend(apiKey);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetLink: string, userName: string): Promise<void> {
    try {
      // احصل على from email من .env أو استخدم default
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

      const { error } = await this.resend.emails.send({
        from: fromEmail,
        to: email,
        subject: 'Reset Your Password - Travel Packages',
        html: this.getPasswordResetEmailTemplate(userName, resetLink),
      });

      if (error) {
        console.error('❌ Resend Error:', error);
        throw new AppError(500, 'Failed to send password reset email');
      }

      console.log(`✅ Password reset email sent to: ${email}`);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, userName: string): Promise<void> {
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

      const { error } = await this.resend.emails.send({
        from: fromEmail,
        to: email,
        subject: 'Welcome to Travel Packages! 🌍',
        html: this.getWelcomeEmailTemplate(userName),
      });

      if (error) {
        console.error('❌ Resend Error:', error);
        throw new AppError(500, 'Failed to send welcome email');
      }

      console.log(`✅ Welcome email sent to: ${email}`);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmation(
    email: string,
    bookingNumber: string,
    packageTitle: string,
    totalPrice: number
  ): Promise<void> {
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

      const { error } = await this.resend.emails.send({
        from: fromEmail,
        to: email,
        subject: `Booking Confirmation - ${bookingNumber}`,
        html: this.getBookingConfirmationTemplate(bookingNumber, packageTitle, totalPrice),
      });

      if (error) {
        console.error('❌ Resend Error:', error);
        throw new AppError(500, 'Failed to send booking confirmation email');
      }

      console.log(`✅ Booking confirmation email sent to: ${email}`);
    } catch (error) {
      console.error('Error sending booking confirmation email:', error);
      throw error;
    }
  }

  /**
   * Send status change email
   */
  async sendStatusChangeEmail(
    email: string,
    bookingNumber: string,
    status: string,
    packageTitle: string
  ): Promise<void> {
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

      const { error } = await this.resend.emails.send({
        from: fromEmail,
        to: email,
        subject: `Booking Status Updated - ${bookingNumber}`,
        html: this.getStatusChangeTemplate(bookingNumber, status, packageTitle),
      });

      if (error) {
        console.error('❌ Resend Error:', error);
        throw new AppError(500, 'Failed to send status change email');
      }

      console.log(`✅ Status change email sent to: ${email}`);
    } catch (error) {
      console.error('Error sending status change email:', error);
      throw error;
    }
  }

  /**
   * Send contact form confirmation email
   */
  async sendContactConfirmation(name: string, email: string): Promise<void> {
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

      const { error } = await this.resend.emails.send({
        from: fromEmail,
        to: email,
        subject: 'We received your message',
        html: this.getContactConfirmationTemplate(name),
      });

      if (error) {
        console.error('❌ Resend Error:', error);
        throw new AppError(500, 'Failed to send contact confirmation email');
      }

      console.log(`✅ Contact confirmation email sent to: ${email}`);
    } catch (error) {
      console.error('Error sending contact confirmation email:', error);
      throw error;
    }
  }

  /**
   * Send notification to admin about new contact
   */
  async sendAdminContactNotification(
    name: string,
    email: string,
    subject: string,
    message: string,
    phone?: string
  ): Promise<void> {
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@resend.dev';
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

      const { error } = await this.resend.emails.send({
        from: fromEmail,
        to: adminEmail,
        subject: `New Contact Form: ${subject}`,
        html: this.getAdminContactNotificationTemplate(name, email, subject, message, phone),
      });

      if (error) {
        console.error('❌ Resend Error:', error);
        throw new AppError(500, 'Failed to send admin notification');
      }

      console.log(`✅ Admin notification sent to: ${adminEmail}`);
    } catch (error) {
      console.error('Error sending admin notification:', error);
      throw error;
    }
  }

  // ==================== EMAIL TEMPLATES ====================

  private getPasswordResetEmailTemplate(userName: string, resetLink: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0;">
        <div style="background-color: #f5f5f5; padding: 40px 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Travel Packages</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Reset Your Password</p>
            </div>

            <!-- Body -->
            <div style="padding: 40px 30px;">
              <p style="color: #666; margin: 0 0 20px 0; font-size: 16px;">
                Hi <strong>${userName}</strong>,
              </p>

              <p style="color: #666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.8;">
                We received a request to reset your password. Click the button below to create a new password. This link will expire in <strong>1 hour</strong>.
              </p>

              <!-- Reset Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; transition: opacity 0.3s ease;">
                  Reset Password
                </a>
              </div>

              <!-- Alternative Link -->
              <p style="color: #999; font-size: 14px; margin: 30px 0 0 0; border-top: 1px solid #eee; padding-top: 20px;">
                Or copy and paste this link in your browser:<br>
                <code style="background-color: #f0f0f0; padding: 10px; border-radius: 4px; word-break: break-all; display: block; margin-top: 10px; font-size: 12px;">
                  ${resetLink}
                </code>
              </p>

              <!-- Warning -->
              <p style="color: #dc3545; font-size: 14px; margin: 20px 0 0 0;">
                ⚠️ If you didn't request this, please ignore this email or contact us immediately.
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Travel Packages Platform. All rights reserved.
              </p>
              <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
                Questions? Contact us at ${process.env.ADMIN_EMAIL || 'support@travelpackages.com'}
              </p>
            </div>

          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getWelcomeEmailTemplate(userName: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Travel Packages</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0;">
        <div style="background-color: #f5f5f5; padding: 40px 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600;">🌍 Welcome to Travel Packages!</h1>
            </div>

            <!-- Body -->
            <div style="padding: 40px 30px;">
              <p style="color: #666; margin: 0 0 20px 0; font-size: 16px;">
                Hi <strong>${userName}</strong>,
              </p>

              <p style="color: #666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.8;">
                Thank you for joining our travel community! We're excited to help you discover amazing destinations around the world and book your next adventure.
              </p>

              <p style="color: #666; margin: 0 0 30px 0; font-size: 16px; line-height: 1.8;">
                Explore our curated collection of travel packages and start planning your journey today!
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${process.env.FRONTEND_URL || 'https://travelpackages.com'}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Explore Packages
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Travel Packages Platform. All rights reserved.
              </p>
            </div>

          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getBookingConfirmationTemplate(bookingNumber: string, packageTitle: string, totalPrice: number): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmed</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0;">
        <div style="background-color: #f5f5f5; padding: 40px 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
            
            <!-- Header -->
            <div style="background: #28a745; color: white; padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600;">✓ Booking Confirmed!</h1>
            </div>

            <!-- Body -->
            <div style="padding: 40px 30px;">
              <p style="color: #666; margin: 0 0 30px 0; font-size: 16px;">
                Thank you for booking with us!
              </p>

              <!-- Booking Details -->
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; border-left: 4px solid #28a745; margin: 20px 0;">
                <p style="margin: 10px 0; color: #666;"><strong>Booking Number:</strong> ${bookingNumber}</p>
                <p style="margin: 10px 0; color: #666;"><strong>Package:</strong> ${packageTitle}</p>
                <p style="margin: 10px 0; color: #666;"><strong>Total Price:</strong> \$${totalPrice.toFixed(2)}</p>
              </div>

              <p style="color: #666; margin: 30px 0; font-size: 14px;">
                We're working on preparing your travel experience. You'll receive further updates via email.
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Travel Packages Platform. All rights reserved.
              </p>
            </div>

          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getStatusChangeTemplate(bookingNumber: string, status: string, packageTitle: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
          <h2>Booking Status Updated</h2>
          <p>Your booking status has been updated to: <strong>${status}</strong></p>
          <p><strong>Booking:</strong> ${bookingNumber}</p>
          <p><strong>Package:</strong> ${packageTitle}</p>
        </div>
      </body>
      </html>
    `;
  }

  private getContactConfirmationTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
          <h2>Thank You for Contacting Us</h2>
          <p>Hi ${name},</p>
          <p>We have received your message and will get back to you as soon as possible.</p>
          <p>Best regards,<br>Travel Packages Team</p>
        </div>
      </body>
      </html>
    `;
  }

  private getAdminContactNotificationTemplate(
    name: string,
    email: string,
    subject: string,
    message: string,
    phone?: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>
      </body>
      </html>
    `;
  }
}
