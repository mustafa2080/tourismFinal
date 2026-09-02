/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';
import { tokenUtils, TokenPayload } from '../utils/tokenUtils.js';
import { UnauthorizedError } from '../utils/errors.js';
import { AppDataSource } from '../config/connection.js';
import { User } from '../entities/User.js';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * 🔐 SECURITY: Verifies the JWT signature AND re-checks the user against the
 * database on every request. A signature-valid token alone is not enough —
 * it stays valid for its full lifetime (up to 30 days for refresh tokens)
 * even after the account is deleted or banned.
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const decoded = tokenUtils.verifyToken(token);

    if (!decoded) {
      throw new UnauthorizedError('Invalid token');
    }

    // Re-validate against the database: catches deleted accounts, banned
    // accounts, and role changes made after the token was issued.
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: decoded.userId } });

    if (!user) {
      throw new UnauthorizedError('User no longer exists');
    }

    if (user.role === 'banned') {
      throw new UnauthorizedError('This account has been banned');
    }

    // Use the current role from the database, not the (possibly stale) role
    // baked into the token, so a role change takes effect immediately.
    req.user = { ...decoded, role: user.role };
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      res.status(401).json({ message: error.message });
    } else {
      console.error('❌ [authMiddleware] Auth failed:', error);
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
