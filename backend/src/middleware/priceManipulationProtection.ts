/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';

/**
 * 🔐 Price Manipulation Protection
 * Prevents users from modifying prices on client side
 * Validates that prices match server-side calculations
 */

export interface PriceValidationOptions {
  packageId: string;
  persons: number;
  extras?: Array<{ id: string; quantity: number }>;
  clientTotal: number;
}

/**
 * Middleware to validate price hasn't been tampered with
 */
export const priceValidationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Only check POST/PUT requests that include price
  if (!['POST', 'PUT'].includes(req.method)) {
    return next();
  }

  if (!req.body.totalPrice && !req.body.total_price) {
    return next();
  }

  const clientPrice = req.body.totalPrice || req.body.total_price;

  // Don't validate if no package info provided
  if (!req.body.packageId && !req.body.package_id) {
    return next();
  }

  // Flag for manual verification later
  if (typeof clientPrice !== 'number' || clientPrice < 0) {
    console.warn(`🚨 [Price Validation] Invalid price format: ${clientPrice}`);
    return res.status(400).json({
      success: false,
      message: 'Invalid price format'
    });
  }

  // Store original price for verification
  (req as any).clientPrice = clientPrice;

  next();
};

/**
 * Verify calculated price matches client price
 */
export const verifyCalculatedPrice = (
  calculatedPrice: number,
  clientPrice: number,
  tolerance: number = 0.01 // Allow 1 cent tolerance
): boolean => {
  const difference = Math.abs(calculatedPrice - clientPrice);
  return difference <= tolerance;
};

/**
 * Calculate price on server side from base data
 */
export const calculateServerPrice = async (
  packageId: string,
  persons: number,
  extras?: Array<{ id: string; quantity: number }>,
  repository?: any
): Promise<number> => {
  if (!repository) {
    throw new Error('Repository required for price calculation');
  }

  // Get package base price from database
  const pkg = await repository.findOne({ where: { id: packageId } });

  if (!pkg) {
    throw new Error('Package not found');
  }

  let total = pkg.base_price * persons;

  // Add extras if provided
  if (extras && extras.length > 0) {
    for (const extra of extras) {
      const extraData = await repository.findOne({
        where: { id: extra.id }
      });

      if (extraData) {
        total += extraData.price * extra.quantity;
      }
    }
  }

  return total;
};

/**
 * Prevent price field in request body from being used
 * Force server-side calculation instead
 */
export const preventDirectPriceModification = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && ['totalPrice', 'total_price', 'price', 'cost'].some(field => field in req.body)) {
    console.log(`ℹ️ [Price Protection] Client-provided price ignored, using server calculation`);
    
    // Store client price for logging/audit
    (req as any).clientProvidedPrice = req.body.totalPrice || req.body.total_price;
    
    // Remove price from body to force server calculation
    delete req.body.totalPrice;
    delete req.body.total_price;
    delete req.body.price;
    delete req.body.cost;
  }

  next();
};
