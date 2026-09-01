/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';

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

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log('🛡️ [adminMiddleware] Checking admin access:', {
    hasUser: !!req.user,
    userId: req.user?.userId,
    email: req.user?.email,
    role: req.user?.role,
    isAdmin: req.user?.role === 'admin'
  });

  if (!req.user) {
    console.error('❌ [adminMiddleware] No user in request');
    return res.status(401).json({ 
      success: false,
      message: 'Unauthorized - No user found' 
    });
  }

  if (req.user.role !== 'admin') {
    console.error('❌ [adminMiddleware] User is not admin:', {
      userRole: req.user.role,
      required: 'admin',
      userId: req.user.userId,
      email: req.user.email
    });
    return res.status(403).json({ 
      success: false,
      message: 'Forbidden - Admin access required' 
    });
  }

  console.log('✅ [adminMiddleware] Admin access granted to:', {
    userId: req.user.userId,
    email: req.user.email
  });
  next();
};

export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
    }

    next();
  };
};
