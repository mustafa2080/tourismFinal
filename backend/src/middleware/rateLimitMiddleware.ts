/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

/**
 * Advanced Rate Limiting Middleware
 * Different limits for different endpoints based on their computational cost
 */

// ⚡ TIER 1: Light endpoints (list views, metadata)
export const lightLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 1000, // 1000 requests
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => req.path === '/health' || req.method === 'OPTIONS',
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.'
    });
  }
});

// ⚡ TIER 2: Medium endpoints (searches, filters)
export const mediumLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 500, // 500 requests
  message: 'Too many requests',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => req.method === 'OPTIONS',
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please slow down.'
    });
  }
});

// ⚡ TIER 3: Heavy endpoints (calculations, file uploads)
export const heavyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // 100 requests
  message: 'Too many heavy operations',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => req.method === 'OPTIONS',
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many operations. Please wait before trying again.'
    });
  }
});

/**
 * General API Rate Limiter (Main limiter for all routes)
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // 5000 requests per 15 minutes (~333 req/sec)
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    return req.path === '/health' || req.method === 'OPTIONS';
  },
  handler: (req: Request, res: Response) => {
    console.warn(`⚠️ [RateLimit] IP ${req.ip} exceeded general limit on ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP'
    });
  }
});

/**
 * Authentication Rate Limiter
 * Strict limits to prevent brute force
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: (req: Request) => req.method === 'OPTIONS',
  handler: (req: Request, res: Response) => {
    console.warn(`⚠️ [RateLimit] Brute force attempt from ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Your account has been temporarily locked.'
    });
  }
});

/**
 * Booking Creation Rate Limiter
 */
export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return (req as any).user?.userId || req.ip || 'unknown';
  },
  skip: (req: Request) => req.method === 'OPTIONS',
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many bookings created'
    });
  }
});

/**
 * Review Creation Rate Limiter
 */
export const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return (req as any).user?.userId || req.ip || 'unknown';
  },
  skip: (req: Request) => req.method === 'OPTIONS',
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many reviews submitted'
    });
  }
});

/**
 * Admin Action Rate Limiter
 */
export const adminActionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return (req as any).user?.userId || 'unknown';
  },
  skip: (req: Request) => req.method === 'OPTIONS',
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many admin actions'
    });
  }
});

export default {
  lightLimiter,
  mediumLimiter,
  heavyLimiter,
  generalLimiter,
  authLimiter,
  bookingLimiter,
  reviewLimiter,
  adminActionLimiter
};
