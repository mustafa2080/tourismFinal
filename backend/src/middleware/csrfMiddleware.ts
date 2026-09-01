/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * 🔐 CSRF Token Middleware - Double Submit Cookie Pattern
 * Protects against Cross-Site Request Forgery (CSRF) attacks
 */

// Store CSRF tokens in memory (in production, use Redis)
const csrfTokenStore = new Map<string, { token: string; expiresAt: number }>();

// Clean up expired tokens every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of csrfTokenStore.entries()) {
    if (value.expiresAt < now) {
      csrfTokenStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // GET requests don't need CSRF protection
  if (req.method === 'GET' || req.method === 'OPTIONS' || req.method === 'HEAD') {
    return next();
  }

  // Allow health check
  if (req.path === '/health') {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] as string;
  const sessionId = req.cookies?.sessionId || req.headers['x-session-id'] as string;

  if (!csrfToken || !sessionId) {
    console.warn(`⚠️ [CSRF] Missing CSRF token or session ID for ${req.method} ${req.path}`);
    return res.status(403).json({
      success: false,
      message: 'CSRF token is missing or invalid'
    });
  }

  const storedToken = csrfTokenStore.get(sessionId);

  if (!storedToken || storedToken.token !== csrfToken) {
    console.warn(`⚠️ [CSRF] CSRF token validation failed for ${req.method} ${req.path}`);
    return res.status(403).json({
      success: false,
      message: 'CSRF token is invalid'
    });
  }

  // Token is valid, proceed
  next();
};

export const csrfTokenGeneratorMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Only generate tokens for GET requests
  if (req.method !== 'GET') {
    return next();
  }

  const sessionId = req.cookies?.sessionId || crypto.randomBytes(16).toString('hex');
  const token = generateCSRFToken();

  // Store token with 24-hour expiration
  csrfTokenStore.set(sessionId, {
    token,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000
  });

  // Set cookie for session ID
  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  // Attach token to response header for client to use
  res.setHeader('X-CSRF-Token', token);
  res.setHeader('X-Session-Id', sessionId);

  // Attach to req object for controller access
  (req as any).csrfToken = token;
  (req as any).sessionId = sessionId;

  next();
};
