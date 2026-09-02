import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/connection.js';
import { User } from '../entities/User.js';
import { AuthService } from '../services/AuthService.js';
import { ResendService } from '../services/ResendService.js';
import { passwordUtils } from '../utils/passwordUtils.js';
import { AppError } from '../utils/errors.js';

export class AuthController {
  private authService: AuthService;
  private resendService: ResendService;

  constructor() {
    const userRepository = AppDataSource.getRepository(User);
    this.authService = new AuthService(userRepository);
    this.resendService = new ResendService();
  }

  /**
   * 🔐 GET /api/auth/csrf-token
   * Get CSRF token for the current session
   * This is automatically called by the frontend on app initialization
   */
  async getCSRFToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // The CSRF token middleware already sets the token in the request object
      const csrfToken = (req as any).csrfToken || res.getHeader('X-CSRF-Token') as string;
      const sessionId = (req as any).sessionId || req.cookies?.sessionId;

      // Return both token and sessionId in response body for client to store
      res.status(200).json({
        success: true,
        message: 'CSRF token retrieved successfully',
        data: {
          csrfToken,
          sessionId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, phone } = req.body;

      const { user, token, refreshToken } = await this.authService.register(
        name,
        email,
        password,
        phone
      );

      // Convert profileImage Buffer to base64 if exists
      let profileImageBase64 = null;
      if (user.profileImage) {
        profileImageBase64 = user.profileImage.toString('base64');
      }

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            profileImage: profileImageBase64,
            profileImageMimeType: user.profileImageMimeType || 'image/jpeg',
            role: user.role,
          },
          token,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const { user, token, refreshToken } = await this.authService.login(
        email,
        password
      );

      // Convert profileImage Buffer to base64 if exists
      let profileImageBase64 = null;
      if (user.profileImage) {
        profileImageBase64 = user.profileImage.toString('base64');
      }

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            profileImage: profileImageBase64,
            profileImageMimeType: user.profileImageMimeType || 'image/jpeg',
            role: user.role,
          },
          token,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      const { token, refreshToken: newRefreshToken } =
        await this.authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed',
        data: {
          token,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      const { oldPassword, newPassword } = req.body;

      await this.authService.changePassword(req.user.userId, oldPassword, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/auth/profile
   * تحديث بيانات المستخدم
   */
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      const { name, phone, avatar, profileImage, profileImageMimeType } = req.body;

      const user = await this.authService.updateProfile(req.user.userId, {
        name,
        phone,
        avatar,
        profileImage: profileImage ? Buffer.from(profileImage, 'base64') : undefined,
        profileImageMimeType,
      });

      // Convert profileImage Buffer to base64 if exists
      let profileImageBase64 = null;
      if (user.profileImage) {
        profileImageBase64 = user.profileImage.toString('base64');
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          profileImage: profileImageBase64,
          profileImageMimeType: user.profileImageMimeType || 'image/jpeg',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/profile
   * جلب بيانات المستخدم
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      console.log('📋 [AuthController.getProfile] Fetching profile for user:', {
        userId: req.user.userId,
        email: req.user.email,
        role: req.user.role
      });

      const user = await this.authService.getUserById(req.user.userId);

      console.log('✅ [AuthController.getProfile] User found:', {
        id: user.id,
        email: user.email,
        role: user.role
      });

      // Convert profileImage Buffer to base64 if exists
      let profileImageBase64 = null;
      if (user.profileImage) {
        profileImageBase64 = user.profileImage.toString('base64');
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
          created_at: user.created_at,
          profileImage: profileImageBase64,
          profileImageMimeType: user.profileImageMimeType || 'image/jpeg',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/profile-image
   * جلب صورة المستخدم
   */
  async getProfileImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      const user = await this.authService.getUserById(req.user.userId);

      if (!user.profileImage) {
        throw new AppError(404, 'Profile image not found');
      }

      res.setHeader('Content-Type', user.profileImageMimeType || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(user.profileImage);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/admin/setup
   * Create first admin account (Setup Route)
   */
  async setupAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fullName, email, password, phone, city, address } = req.body;

      // Validate required fields
      if (!fullName || !email || !password) {
        throw new AppError(400, 'Full name, email, and password are required');
      }

      // Check if admin already exists
      const adminExists = await this.authService.checkAdminExists();
      if (adminExists) {
        throw new AppError(400, 'Admin account already exists');
      }

      // Register as admin
      const { user, token, refreshToken } = await this.authService.register(
        fullName,
        email,
        password,
        phone,
        'admin' // Force admin role
      );

      res.status(201).json({
        success: true,
        message: 'Admin account created successfully',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
          },
          token,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/forgot-password
   * 🔐 طلب نسيت كلمة المرور
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        throw new AppError(400, 'Email is required');
      }

      // 🔐 SECURITY: Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError(400, 'Invalid email format');
      }

      // 🔐 SECURITY: Rate limit by IP to prevent brute force email enumeration
      // محاولة توليد reset token
      const { resetLink } = await this.authService.forgotPassword(email);

      // الحصول على بيانات المستخدم للإرسال
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { email } });

      if (user) {
        // 🔐 SECURITY: Generate secure reset token with expiration
        // إرسال email باستخدام Resend
        try {
          await this.resendService.sendPasswordResetEmail(email, resetLink, user.name);
          console.log(`✅ Password reset email sent successfully to: ${email}`);
        } catch (emailError) {
          console.error(`⚠️ Failed to send email to ${email}:`, emailError);
          // ما نرسل error - المستخدم حفظ reset link في database
        }
      }

      // رسالة أمنية (لا نكشف إذا كان الإيميل موجوداً أم لا)
      res.status(200).json({
        success: true,
        message: 'If an account exists with this email, you will receive reset instructions',
      });
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      // رسالة أمنية موحدة حتى في حالة الخطأ
      res.status(200).json({
        success: true,
        message: 'If an account exists with this email, you will receive reset instructions',
      });
    }
  }

  /**
   * POST /api/auth/reset-password
   * 🔐 إعادة تعيين كلمة المرور
   */
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { resetToken, newPassword, confirmPassword } = req.body;

      if (!resetToken || !newPassword || !confirmPassword) {
        throw new AppError(400, 'Reset token, password, and confirmation are required');
      }

      // 🔐 SECURITY: Validate password strength
      if (!passwordUtils.isPasswordStrong(newPassword)) {
        throw new AppError(400, 'Password must be at least 8 characters with uppercase, lowercase, and numbers');
      }

      if (newPassword !== confirmPassword) {
        throw new AppError(400, 'Passwords do not match');
      }

      // 🔐 SECURITY: Invalidate all existing tokens after password reset
      // إعادة تعيين كلمة المرور
      const user = await this.authService.resetPassword(resetToken, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password has been reset successfully',
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/verify-reset-token/:token
   * التحقق من صحة reset token
   */
  async verifyResetToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;

      if (!token) {
        throw new AppError(400, 'Reset token is required');
      }

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { reset_token: token },
      });

      if (!user) {
        throw new AppError(400, 'Invalid reset token');
      }

      if (!user.reset_token_expires || user.reset_token_expires < new Date()) {
        throw new AppError(400, 'Reset token has expired');
      }

      res.status(200).json({
        success: true,
        message: 'Reset token is valid',
        data: {
          email: user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
