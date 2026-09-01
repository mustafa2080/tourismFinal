import { Repository } from 'typeorm';
import { User } from '../entities/User.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { passwordUtils } from '../utils/passwordUtils.js';
import { tokenUtils } from '../utils/tokenUtils.js';
import { ValidationError, ConflictError, UnauthorizedError } from '../utils/errors.js';
import { NotificationService } from './NotificationService.js';
import { ResendService } from './ResendService.js';

export class AuthService {
  private userRepository: UserRepository;

  constructor(userRepo: Repository<User>) {
    this.userRepository = new UserRepository(userRepo);
  }

  async register(
    name: string,
    email: string,
    password: string,
    phone?: string,
    role: 'customer' | 'admin' = 'customer'
  ): Promise<{ user: User; token: string; refreshToken: string }> {
    // التحقق من صحة البيانات
    if (!name || !email || !password) {
      throw new ValidationError('Name, email, and password are required');
    }

    if (!passwordUtils.isPasswordStrong(password)) {
      throw new ValidationError(
        'Password must be at least 8 characters with uppercase, lowercase, and numbers'
      );
    }

    // التحقق من عدم وجود المستخدم
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // تشفير كلمة المرور
    const passwordHash = await passwordUtils.hashPassword(password);

    // إنشاء المستخدم
    const user = await this.userRepository.create({
      name,
      email,
      phone,
      password_hash: passwordHash,
      role: role,
    });

    // توليد الـ tokens
    const token = tokenUtils.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = tokenUtils.generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // 🔔 إرسال إشعار ترحيبي
    try {
      const notificationService = new NotificationService();
      await notificationService.createNotification(
        user.id,
        'general',
        'مرحباً في التطبيق! 👋',
        `${name}، أهلاً وسهلاً في عائلتنا. استمتع باستكشاف أفضل الرحلات السياحية.`,
        { userName: name }
      );
      console.log(`✅ Welcome notification created for user: ${user.id}`);
    } catch (error) {
      console.error('⚠️ Failed to send welcome notification:', error);
    }

    // 📧 إرسال welcome email عبر Resend
    try {
      const resendService = new ResendService();
      await resendService.sendWelcomeEmail(email, name);
      console.log(`✅ Welcome email sent to: ${email}`);
    } catch (error) {
      console.error('⚠️ Failed to send welcome email via Resend:', error);
    }

    return { user, token, refreshToken };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: User; token: string; refreshToken: string }> {
    // البحث عن المستخدم
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await passwordUtils.comparePassword(
      password,
      user.password_hash
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // توليد الـ tokens
    const token = tokenUtils.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = tokenUtils.generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token, refreshToken };
  }

  async refreshToken(
    refreshToken: string
  ): Promise<{ token: string; refreshToken: string }> {
    const decoded = tokenUtils.verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const user = await this.userRepository.findById(decoded.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const token = tokenUtils.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = tokenUtils.generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { token, refreshToken: newRefreshToken };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const isPasswordValid = await passwordUtils.comparePassword(
      oldPassword,
      user.password_hash
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid password');
    }

    const newPasswordHash = await passwordUtils.hashPassword(newPassword);
    await this.userRepository.updatePassword(userId, newPasswordHash);
  }

  /**
   * تحديث بيانات المستخدم
   */
  async updateProfile(
    userId: string,
    updates: { name?: string; phone?: string; avatar?: string; profileImage?: Buffer; profileImageMimeType?: string }
  ): Promise<User> {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // تحديث البيانات
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.phone) updateData.phone = updates.phone;
    if (updates.avatar !== undefined) updateData.avatar = updates.avatar;
    if (updates.profileImage !== undefined) updateData.profileImage = updates.profileImage;
    if (updates.profileImageMimeType !== undefined) updateData.profileImageMimeType = updates.profileImageMimeType;

    const updatedUser = await this.userRepository.update(userId, updateData);
    if (!updatedUser) {
      throw new UnauthorizedError('Failed to update user');
    }
    return updatedUser;
  }

  /**
   * جلب بيانات المستخدم
   */
  async getUserById(userId: string): Promise<User> {
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return user;
  }

  /**
   * Check if admin already exists
   */
  async checkAdminExists(): Promise<boolean> {
    const adminUser = await this.userRepository.repository.findOne({
      where: { role: 'admin' },
    });
    return !!adminUser;
  }

  /**
   * 🔐 تطلب نسيت كلمة المرور - توليد reset token
   */
  async forgotPassword(email: string): Promise<{ resetToken: string; resetLink: string }> {
    const user = await this.userRepository.findByEmail(email);
    
    // إذا الإيميل ما موجود، نرجع null بدل error (للأمان)
    if (!user) {
      console.log(`ℹ️ Forgot password request for non-existent email: ${email}`);
      return { resetToken: '', resetLink: '' };
    }

    // توليد reset token (64 chars random)
    const resetToken = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15) +
                       Math.random().toString(36).substring(2, 15);

    // تعيين صلاحية 1 ساعة
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

    // حفظ في database
    await this.userRepository.update(user.id, {
      reset_token: resetToken,
      reset_token_expires: resetTokenExpires,
    });

    // بناء رابط reset
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    console.log(`✅ Reset token generated for user: ${email}`);

    return { resetToken, resetLink };
  }

  /**
   * 🔐 إعادة تعيين كلمة المرور
   */
  async resetPassword(resetToken: string, newPassword: string): Promise<User> {
    if (!resetToken || !newPassword) {
      throw new ValidationError('Reset token and new password are required');
    }

    if (!passwordUtils.isPasswordStrong(newPassword)) {
      throw new ValidationError(
        'Password must be at least 8 characters with uppercase, lowercase, and numbers'
      );
    }

    // البحث عن user بناءً على reset token
    const user = await this.userRepository.repository.findOne({
      where: { reset_token: resetToken },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid or expired reset token');
    }

    // التحقق من انتهاء الصلاحية
    if (!user.reset_token_expires || user.reset_token_expires < new Date()) {
      throw new UnauthorizedError('Reset token has expired');
    }

    // تشفير كلمة المرور الجديدة
    const newPasswordHash = await passwordUtils.hashPassword(newPassword);

    // تحديث المستخدم
    const updatedUser = await this.userRepository.update(user.id, {
      password_hash: newPasswordHash,
      reset_token: null,
      reset_token_expires: null,
    });

    if (!updatedUser) {
      throw new UnauthorizedError('Failed to reset password');
    }

    console.log(`✅ Password reset successfully for user: ${user.email}`);

    return updatedUser;
  }
}
