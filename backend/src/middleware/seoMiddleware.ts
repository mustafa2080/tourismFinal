/**
 * SEO Middleware
 * Handles security headers and SEO optimization for backend responses
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Set security and SEO headers
 */
export const seoHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https: wss:;"
  );

  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // X-XSS-Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );

  // Cache-Control for different routes
  if (req.path.includes('/api/packages') || req.path.includes('/api/tours')) {
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  } else if (req.path.includes('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  }

  // HSTS (HTTP Strict Transport Security)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
};

/**
 * Add structured data headers
 */
export const structuredDataMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Add structured data type based on endpoint
  if (req.path.includes('/packages')) {
    res.setHeader('X-Schema-Type', 'Product');
  } else if (req.path.includes('/blog')) {
    res.setHeader('X-Schema-Type', 'Article');
  } else if (req.path.includes('/search')) {
    res.setHeader('X-Schema-Type', 'SearchResultsPage');
  }

  next();
};

/**
 * Track SEO metrics
 */
export const seoMetricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    if (process.env.DEBUG_SEO === 'true') {
      console.log(`[SEO] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    }

    // Log slow queries for optimization
    if (duration > 1000) {
      console.warn(`[SEO-WARN] Slow endpoint detected: ${req.path} took ${duration}ms`);
    }
  });

  next();
};

export default seoHeadersMiddleware;
