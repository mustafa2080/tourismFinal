/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/connection.js';
import { User } from '../entities/User.js';
import { AppError } from '../utils/errors.js';

/**
 * 🔐 Enhanced Authentication Middleware - Prevents Broken Authentication
 * Verifies token, checks user existence, and validates user permissions
 */

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
        iat?: number;
        exp?: number;
      };
    }
  }
}

export const enhancedAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const { tokenUtils } = await import('../utils/tokenUtils.js');
    const decoded = tokenUtils.verifyToken(token);

    if (!decoded) {
      console.warn(`⚠️ [Enhanced Auth] Invalid token for ${req.path}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Validate user still exists in database
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.userId }
    });

    if (!user) {
      console.warn(`⚠️ [Enhanced Auth] User not found: ${decoded.userId}`);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate user is still active/not banned
    if ((user as any).status === 'banned' || (user as any).is_deleted) {
      console.warn(`⚠️ [Enhanced Auth] User account inactive: ${decoded.userId}`);
      return res.status(401).json({
        success: false,
        message: 'User account is no longer active'
      });
    }

    // Validate token role matches user role
    if (decoded.role !== user.role) {
      console.warn(`⚠️ [Enhanced Auth] Role mismatch for user: ${decoded.userId}`);
      return res.status(401).json({
        success: false,
        message: 'Token role does not match user role'
      });
    }

    // Check token age - force re-authentication after a certain time
    const maxTokenAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    const tokenAge = Date.now() - (decoded.iat ? decoded.iat * 1000 : Date.now());
    
    if (tokenAge > maxTokenAge) {
      console.warn(`⚠️ [Enhanced Auth] Token too old: ${tokenAge}ms for user: ${decoded.userId}`);
      return res.status(401).json({
        success: false,
        message: 'Token has expired, please login again'
      });
    }

    // Token is valid
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ [Enhanced Auth] Authentication failed:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};
