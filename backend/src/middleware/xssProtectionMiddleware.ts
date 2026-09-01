/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';

/**
 * 🔐 XSS Prevention Middleware
 * Sanitizes and validates input to prevent Cross-Site Scripting attacks
 */

// XSS patterns to block
const XSS_PATTERNS = [
  /<script[^>]*>[\s\S]*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // Event handlers like onclick=
  /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
  /<embed[^>]*>/gi,
  /<object[^>]*>/gi,
];

export const sanitizeXSSInput = (value: any): any => {
  if (typeof value === 'string') {
    let sanitized = value;
    
    // Remove dangerous patterns
    for (const pattern of XSS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }
    
    // Encode HTML special characters
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
    
    return sanitized;
  } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const sanitized: any = {};
    for (const key in value) {
      sanitized[key] = sanitizeXSSInput(value[key]);
    }
    return sanitized;
  } else if (Array.isArray(value)) {
    return value.map(item => sanitizeXSSInput(item));
  }
  
  return value;
};

export const xssProtectionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const checkForXSS = (value: any, path: string = ''): boolean => {
    if (typeof value === 'string') {
      for (const pattern of XSS_PATTERNS) {
        if (pattern.test(value)) {
          console.warn(`🚨 [XSS Alert] Suspicious pattern detected in ${path}: ${value.substring(0, 100)}`);
          return true;
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        if (checkForXSS(value[key], `${path}.${key}`)) {
          return true;
        }
      }
    }
    return false;
  };

  // Check for XSS patterns in request body, query, and params
  if (req.body && checkForXSS(req.body, 'body')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected'
    });
  }

  if (req.query && checkForXSS(req.query, 'query')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected'
    });
  }

  if (req.params && checkForXSS(req.params, 'params')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected'
    });
  }

  next();
};
