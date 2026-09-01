/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';

/**
 * 🔐 Security Headers Middleware
 * Adds additional security headers beyond Helmet
 */

export const advancedSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Content Security Policy (additional)
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' http://localhost:5000",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '));

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS filtering
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Feature Policy (Permissions Policy)
  res.setHeader('Permissions-Policy', [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()'
  ].join(', '));

  // HSTS (HTTP Strict Transport Security)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Disable browser caching for sensitive pages
  if (req.path.includes('/auth') || req.path.includes('/admin') || req.path.includes('/profile')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
};

/**
 * Request Size Limit Middleware
 * Prevents DoS attacks through large payloads
 */
export const requestSizeLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const maxContentLength = 100 * 1024 * 1024; // 100MB
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);

  if (contentLength > maxContentLength) {
    return res.status(413).json({
      success: false,
      message: 'Request payload too large'
    });
  }

  next();
};

/**
 * Prevent HTTP Parameter Pollution
 */
export const preventParameterPollution = (req: Request, res: Response, next: NextFunction) => {
  // Check for duplicate parameters in query string
  const queryString = req.url.split('?')[1] || '';
  const params = new Set<string>();

  queryString.split('&').forEach(param => {
    const key = param.split('=')[0];
    if (params.has(key)) {
      console.warn(`⚠️ [Parameter Pollution] Duplicate parameter detected: ${key}`);
      return;
    }
    params.add(key);
  });

  next();
};

/**
 * API Key Validation (if using API keys)
 */
export const validateAPIKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;

  // For endpoints that might require API key
  if (req.path.startsWith('/api/public')) {
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key is required'
      });
    }

    // Validate API key (implement your logic here)
    // This is just a placeholder
    if (apiKey !== process.env.PUBLIC_API_KEY) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key'
      });
    }
  }

  next();
};
