/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { logger } from './logger.js';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('🔴 [errorHandler] Error caught:', {
    message: error.message,
    type: error.constructor.name,
    path: req.path,
    method: req.method,
    stack: error.stack?.split('\n').slice(0, 3).join('\n')
  });

  if (error instanceof AppError) {
    console.error('   ▶ AppError with statusCode:', error.statusCode);
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      statusCode: error.statusCode,
    });
  }

  // Log unexpected errors
  logger.error('Unexpected error:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  console.error('   ▶ Generic error, returning 500');
  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    statusCode: 500,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
};
