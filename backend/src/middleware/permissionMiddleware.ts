/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, AppError } from '../utils/errors.js';

/**
 * Permission Middleware - Checks if user has permission to access resource
 * Prevents users from accessing/modifying other users' data
 */

export interface PermissionCheckOptions {
  resourceOwnerField?: string; // Field in database containing owner ID
  allowAdmin?: boolean; // Allow admins to bypass permission check
  checkParams?: boolean; // Check req.params for resource ID
}

/**
 * Check if user owns the resource
 */
export const checkResourceOwnership = (options: PermissionCheckOptions = {}) => {
  const {
    resourceOwnerField = 'user_id',
    allowAdmin = true,
    checkParams = true
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('User not found in request');
      }

      // Allow admins to bypass if configured
      if (allowAdmin && req.user.role === 'admin') {
        console.log(`✅ [Permission] Admin bypass allowed for ${req.user.userId}`);
        return next();
      }

      // Get the resource owner ID from request
      // Can come from body, params, or database lookup
      const ownerId = req.body?.[resourceOwnerField] || 
                      req.params?.userId ||
                      req.params?.id;

      if (!ownerId) {
        throw new AppError(400, 'Resource owner ID not found');
      }

      // Check if user owns the resource
      if (req.user.userId !== ownerId) {
        console.warn(`⚠️ [Permission] User ${req.user.userId} denied access to resource owned by ${ownerId}`);
        throw new ForbiddenError('You do not have permission to access this resource');
      }

      console.log(`✅ [Permission] User ${req.user.userId} has access to their resource`);
      next();
    } catch (error) {
      if (error instanceof ForbiddenError || error instanceof AppError) {
        return res.status(error.statusCode || 403).json({
          success: false,
          message: error.message
        });
      }
      res.status(403).json({ message: 'Permission denied' });
    }
  };
};

/**
 * Check if user has specific role
 */
export const checkRole = (requiredRole: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!roles.includes(req.user.role)) {
      console.warn(`⚠️ [Permission] User ${req.user.userId} with role '${req.user.role}' denied access requiring '${roles.join(', ')}'`);
      return res.status(403).json({ 
        success: false,
        message: 'Insufficient permissions' 
      });
    }

    console.log(`✅ [Permission] User ${req.user.userId} has required role`);
    next();
  };
};

/**
 * Verify user is accessing their own resource
 * Usage: app.get('/users/:userId', verifyOwner('userId'), handler)
 */
export const verifyOwner = (paramName: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      const resourceId = req.params[paramName];

      if (!resourceId) {
        throw new AppError(400, `Missing ${paramName} in request`);
      }

      // Users can only access their own data unless they're admin
      if (req.user.role !== 'admin' && req.user.userId !== resourceId) {
        console.warn(`⚠️ [Permission] User ${req.user.userId} attempted unauthorized access to ${paramName}: ${resourceId}`);
        throw new ForbiddenError('You can only access your own data');
      }

      console.log(`✅ [Permission] Owner verification passed for user ${req.user.userId}`);
      next();
    } catch (error) {
      if (error instanceof ForbiddenError || error instanceof AppError) {
        return res.status(error.statusCode || 403).json({
          success: false,
          message: error.message
        });
      }
      res.status(403).json({ message: 'Permission denied' });
    }
  };
};

export default {
  checkResourceOwnership,
  checkRole,
  verifyOwner
};
