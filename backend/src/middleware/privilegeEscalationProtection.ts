/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';

/**
 * 🔐 Privilege Escalation Prevention Middleware
 * Prevents users from escalating their privileges
 * Ensures sensitive operations can only be performed by authorized roles
 */

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware to prevent role tampering in request body
 */
export const preventRoleTampering = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && (req.body.role || req.body.admin || req.body.isAdmin)) {
    console.warn(`🚨 [Privilege Escalation] Attempted role tampering from user ${req.user?.userId}`);
    
    // Remove any role-related fields from the request body
    delete req.body.role;
    delete req.body.admin;
    delete req.body.isAdmin;
    delete req.body.permissions;
    delete req.body.level;
  }

  next();
};

/**
 * Require admin role for sensitive operations
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - User not found'
    });
  }

  if (req.user.role !== 'admin') {
    console.warn(`🚨 [Privilege Escalation] Non-admin user ${req.user.userId} attempted admin operation on ${req.path}`);
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

/**
 * Require specific role
 */
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      console.warn(`🚨 [Privilege Escalation] User ${req.user.userId} with role ${req.user.role} attempted operation requiring ${roles.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: `Insufficient privileges. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Prevent access to sensitive fields in responses
 */
export const removeSensitiveFields = (obj: any, fieldsToRemove: string[] = []): any => {
  const defaultSensitiveFields = [
    'password_hash',
    'passwordHash',
    'password',
    'reset_token',
    'resetToken',
    'api_key',
    'apiKey',
    'secret',
    'refresh_token',
    'refreshToken',
  ];

  const allFieldsToRemove = [...defaultSensitiveFields, ...fieldsToRemove];

  if (!obj) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => removeSensitiveFields(item, fieldsToRemove));
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  const cleaned: any = {};
  for (const key in obj) {
    if (!allFieldsToRemove.includes(key)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        cleaned[key] = removeSensitiveFields(obj[key], fieldsToRemove);
      } else {
        cleaned[key] = obj[key];
      }
    }
  }

  return cleaned;
};
