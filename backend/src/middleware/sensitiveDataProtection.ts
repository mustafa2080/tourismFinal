/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';

/**
 * 🔐 Sensitive Data Protection Middleware
 * Prevents exposure of sensitive information in logs and responses
 */

const SENSITIVE_FIELDS = [
  'password',
  'password_hash',
  'passwordHash',
  'token',
  'refreshToken',
  'reset_token',
  'resetToken',
  'secret',
  'api_key',
  'apiKey',
  'credit_card',
  'creditCard',
  'cvv',
  'ssn',
  'social_security_number',
  'socialSecurityNumber',
];

export const maskSensitiveData = (obj: any): any => {
  if (!obj) return obj;

  if (typeof obj === 'string') {
    return obj;
  }

  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => maskSensitiveData(item));
  }

  const masked: any = {};
  for (const key in obj) {
    if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      masked[key] = '***REDACTED***';
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      masked[key] = maskSensitiveData(obj[key]);
    } else {
      masked[key] = obj[key];
    }
  }
  return masked;
};

export const sensitiveDataProtectionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Log with masked data in development
  if (process.env.NODE_ENV === 'development' && (req.method === 'POST' || req.method === 'PUT')) {
    const maskedBody = maskSensitiveData(req.body);
    console.log(`📨 [${req.method}] ${req.path}`, maskedBody);
  }

  next();
};

/**
 * Wrap response to remove sensitive data before sending
 */
export const removeSensitiveDataFromResponse = (data: any): any => {
  return maskSensitiveData(data);
};
