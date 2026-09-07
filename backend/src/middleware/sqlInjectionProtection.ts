/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';

/**
 * 🔐 SQL Injection Prevention Middleware
 * Detects and blocks common SQL injection patterns.
 *
 * NOTE: earlier patterns here matched bare SQL keywords (SELECT, WHERE,
 * OR, AND, ...) anywhere in a string. That's too aggressive — ordinary
 * text like a blog/category description ("Select your favorite spot",
 * "Where adventure begins") would false-positive and get rejected with
 * "Invalid input detected". These patterns now require SQL-shaped
 * syntax around the keyword (quotes, semicolons, comment markers,
 * parentheses) so plain English prose is left alone while actual
 * injection payloads are still caught.
 */

const SQL_INJECTION_PATTERNS = [
  // Keyword immediately preceded/followed by SQL syntax, e.g. `' OR 1=1--`,
  // `'; DROP TABLE users;--`, `1) UNION SELECT`, not just the bare word.
  /('|"|;|--|\/\*)\s*(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXECUTE|EXEC)\b/gi,
  /\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXECUTE|EXEC)\b\s*('|"|;|--|\/\*|\()/gi,
  /(-{2,}|\/\*[\s\S]*?\*\/)/g, // SQL comment syntax
  /(\bOR\b|\bAND\b)\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?/gi, // OR 1=1 / OR '1'='1'
  /;\s*(DROP|DELETE|UPDATE|INSERT)\b/gi, // stacked statement injection
  /\bUNION\b\s+(ALL\s+)?\bSELECT\b/gi, // UNION-based injection — this two-keyword
  // sequence essentially never appears in legitimate prose, so it's safe to
  // catch without requiring surrounding SQL punctuation.
  /\b(xp_|sp_)\w+/gi, // stored procedures
];

export const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction) => {
  const checkForSQLInjection = (value: any, path: string = ''): boolean => {
    if (typeof value === 'string') {
      for (const pattern of SQL_INJECTION_PATTERNS) {
        if (pattern.test(value)) {
          console.warn(`🚨 [SQL Injection Alert] Suspicious pattern detected in ${path}: ${value.substring(0, 100)}`);
          return true;
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        if (checkForSQLInjection(value[key], `${path}.${key}`)) {
          return true;
        }
      }
    }
    return false;
  };

  if (req.query) {
    if (checkForSQLInjection(req.query, 'query')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input detected'
      });
    }
  }

  if (req.body) {
    if (checkForSQLInjection(req.body, 'body')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input detected'
      });
    }
  }

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
