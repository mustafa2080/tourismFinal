/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';

/**
 * 🔐 SQL Injection Prevention Middleware
 * Detects and blocks common SQL injection patterns
 */

// List of SQL keywords that shouldn't appear in normal user input
const SQL_INJECTION_PATTERNS = [
  /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXECUTE|EXEC)\b)/gi,
  /(-{2})/g, // SQL comments
  /(\/\*|\*\/)/g, // Multi-line comments
  /(;|\||&&)/g, // Statement terminators and logical operators
  /(\bOR\b|\bAND\b)[\s]+1[\s]*=[\s]*1/gi, // Classic OR 1=1
  /(\bWHERE\b)/gi, // WHERE clause in unexpected places
  /(xp_|sp_)/gi, // Stored procedures
];

export const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction) => {
  const checkForSQLInjection = (value: any, path: string = ''): boolean => {
    if (typeof value === 'string') {
      // Check for SQL injection patterns
      for (const pattern of SQL_INJECTION_PATTERNS) {
        if (pattern.test(value)) {
          console.warn(`🚨 [SQL Injection Alert] Suspicious pattern detected in ${path}: ${value.substring(0, 100)}`);
          return true;
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      // Recursively check nested objects
      for (const key in value) {
        if (checkForSQLInjection(value[key], `${path}.${key}`)) {
          return true;
        }
      }
    }
    return false;
  };

  // Check query parameters
  if (req.query) {
    if (checkForSQLInjection(req.query, 'query')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input detected'
      });
    }
  }

  // Check request body
  if (req.body) {
    if (checkForSQLInjection(req.body, 'body')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input detected'
      });
    }
  }

  // Check URL parameters
  if (req.params) {
    if (checkForSQLInjection(req.params, 'params')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input detected'
      });
    }
  }

  next();
};
