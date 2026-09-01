/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';

/**
 * 🔐 IDOR (Insecure Direct Object Reference) Protection
 * Prevents users from accessing resources they don't own
 * Ensures authorization checks are in place
 */

export interface IDORCheckOptions {
  ownerField?: string; // Field in the object containing owner ID
  paramName?: string; // Name of the parameter containing the resource ID
  allowAdmin?: boolean; // Allow admins to bypass check
}

/**
 * Check if user owns the resource based on owner field
 */
export const checkResourceOwner = (
  resourceOwnerId: string,
  userId: string,
  userRole?: string,
  allowAdmin: boolean = true
): boolean => {
  // Allow admins to access any resource
  if (allowAdmin && userRole === 'admin') {
    console.log(`✅ [IDOR] Admin access allowed for resource owner: ${resourceOwnerId}`);
    return true;
  }

  // Check if user owns the resource
  if (resourceOwnerId !== userId) {
    console.warn(`🚨 [IDOR] Access denied: User ${userId} attempted to access resource owned by ${resourceOwnerId}`);
    return false;
  }

  return true;
};

/**
 * Middleware to verify IDOR - Check if resource belongs to authenticated user
 */
export const idorProtectionMiddleware = (options: IDORCheckOptions = {}) => {
  const {
    ownerField = 'user_id',
    paramName = 'id',
    allowAdmin = true
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized - User not found');
      }

      // Get resource ID from params
      const resourceId = req.params[paramName];

      if (!resourceId) {
        throw new AppError(400, `Missing required parameter: ${paramName}`);
      }

      // For PUT/DELETE/PATCH methods, check resource ownership
      if (['PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        // Check body for owner field
        if (req.body && req.body[ownerField]) {
          const resourceOwnerId = req.body[ownerField];

          if (!checkResourceOwner(resourceOwnerId, req.user.userId, req.user.role, allowAdmin)) {
            return res.status(403).json({
              success: false,
              message: 'You do not have permission to modify this resource'
            });
          }
        }
      }

      // For GET methods, check if accessing own resource
      if (req.method === 'GET') {
        // If resource ID matches user ID, allow access
        if (resourceId !== req.user.userId && req.user.role !== 'admin') {
          // Allow if it's a public resource (don't restrict all GET requests)
          // This is enforced at controller level
          console.log(`ℹ️ [IDOR] User ${req.user.userId} accessing resource ${resourceId} - check enforced at controller`);
        }
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
  };
};

/**
 * Verify user can only access their own data
 */
export const verifyUserOwnership = (paramName: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      const resourceUserId = req.params[paramName];

      if (!resourceUserId) {
        throw new AppError(400, `Missing required parameter: ${paramName}`);
      }

      // Users can only access their own data unless they're admin
      if (req.user.role !== 'admin' && req.user.userId !== resourceUserId) {
        console.warn(`🚨 [IDOR] User ${req.user.userId} attempted to access data for user ${resourceUserId}`);
        throw new AppError(403, 'You can only access your own data');
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
  };
};
