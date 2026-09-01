/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';
import { tokenUtils, TokenPayload } from '../utils/tokenUtils';
import { UnauthorizedError } from '../utils/errors';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    console.log('🔐 [authMiddleware] Checking token:', {
      method: req.method,
      path: req.path,
      hasToken: !!token,
    });

    if (!token) {
      console.warn('⚠️ [authMiddleware] No token provided');
      throw new UnauthorizedError('No token provided');
    }

    const decoded = tokenUtils.verifyToken(token);

    console.log('✅ [authMiddleware] Token verified:', {
      userId: decoded?.userId,
      email: decoded?.email,
      role: decoded?.role,
      valid: !!decoded
    });

    if (!decoded) {
      console.error('❌ [authMiddleware] Invalid token');
      throw new UnauthorizedError('Invalid token');
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ [authMiddleware] Auth failed:', error);
    if (error instanceof UnauthorizedError) {
      res.status(401).json({ message: error.message });
    } else {
      res.status(401).json({ message: 'Invalid token' });
    }
  }
};

export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = tokenUtils.verifyToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }

    next();
  } catch {
    next();
  }
};
