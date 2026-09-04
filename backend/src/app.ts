import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import 'dotenv/config';

import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import { auditMiddleware } from './middleware/auditMiddleware.js';
import { generalLimiter } from './middleware/rateLimitMiddleware.js';
import { cacheMiddleware } from './middleware/cachingMiddleware.js';
import { xssProtectionMiddleware } from './middleware/xssProtectionMiddleware.js';
import { sqlInjectionProtection } from './middleware/sqlInjectionProtection.js';
import { sensitiveDataProtectionMiddleware } from './middleware/sensitiveDataProtection.js';
import { csrfTokenGeneratorMiddleware, csrfMiddleware } from './middleware/csrfMiddleware.js';
import { WebSocketService } from './websocket/socket.js';
import { AppDataSource } from './config/connection.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import packageRoutes from './routes/package.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import reviewRoutes from './routes/review.routes.js';
import blogRoutes from './routes/blog.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import adminRoutes from './routes/admin.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import contactRoutes from './routes/contact.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import categoryRoutes from './routes/category.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import itineraryRoutes from './routes/itinerary.routes.js';
import customTripRoutes from './routes/customTrip.routes.js';
import translationRoutes from './routes/translation.routes.js';
import monitoringRoutes from './routes/monitoring.routes.js';

export const createApp = (): Express => {
  const app = express();

  // Trust the first hop proxy (nginx) so req.ip / X-Forwarded-For are read
  // correctly. Without this, express-rate-limit and other IP-based checks
  // misbehave (and log ERR_ERL_UNEXPECTED_X_FORWARDED_FOR) whenever nginx
  // forwards that header, which happens on every production request here.
  app.set('trust proxy', 1);

  // ============================================================================
  // CORS MIDDLEWARE - MUST BE FIRST (BEFORE HELMET & RATE LIMIT)
  // ============================================================================
  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://localhost:5177',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:8000',
        process.env.FRONTEND_URL,
      ].filter(Boolean);

      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS rejected origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-CSRF-Token', 'X-Session-Id'],
    exposedHeaders: ['X-CSRF-Token', 'X-Session-Id', 'Set-Cookie'],
    preflightContinue: false,
    maxAge: 86400, // 24 hours
  };
  
  // Apply CORS FIRST - before any other middleware
  app.use(cors(corsOptions));

  // ✅ HANDLE PREFLIGHT REQUESTS EXPLICITLY
  app.options('*', cors(corsOptions));

  // ============================================================================
  // Compression Middleware
  // ============================================================================
  
  // Enable gzip compression for responses > 1KB
  app.use(compression({
    level: 6, // Balance between speed and compression (0-9)
    threshold: 1024, // Only compress responses > 1KB
    filter: (req: Request, res: Response) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));

  // ============================================================================
  // Security Middleware
  // ============================================================================

  // Helmet - Set various HTTP headers (AFTER CORS)
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for development to avoid issues with fonts/images
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }));

  // Rate Limiting - Apply AFTER CORS and Helmet (but before body parser)
  app.use(generalLimiter);

  // ✅ BODY PARSER FIRST - BEFORE ANY OTHER MIDDLEWARE
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));

  // ✅ CATCH JSON PARSE ERRORS
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      console.error('🔴 [JSON Parse Error]:', {
        message: err.message,
        path: req.path,
        method: req.method,
        contentType: req.get('content-type')
      });
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON in request body',
        error: process.env.NODE_ENV === 'production' ? 'Invalid request' : err.message
      });
    }
    next(err);
  });

  // 🔐 Security: XSS Protection - Block malicious input
  app.use(xssProtectionMiddleware);

  // 🔐 Security: SQL Injection Protection
  app.use(sqlInjectionProtection);

  // 🔐 Security: Sensitive Data Protection
  app.use(sensitiveDataProtectionMiddleware);

  // 🔐 Security: CSRF Protection - Token Generator (for GET requests)
  app.use(csrfTokenGeneratorMiddleware);

  // 🔐 Security: CSRF Protection - Token Validation (for POST/PUT/DELETE)
  app.use(csrfMiddleware);

  // Audit logging middleware
  app.use(auditMiddleware);

  // ✅ REQUEST LOGGING - AFTER BODY PARSER
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'POST' || req.method === 'PUT') {
      try {
        const bodySize = JSON.stringify(req.body).length;
        console.log(`📨 [${req.method}] ${req.path}`);
        console.log(`   Body size: ${(bodySize / 1024 / 1024).toFixed(2)}MB`);
        console.log(`   Fields:`, Object.keys(req.body));
      } catch (e) {
        console.log(`📨 [${req.method}] ${req.path} - (body logging error)`);
      }
    }
    next();
  });

  // ⚡ SMART CACHING - Cache GET requests
  app.use(cacheMiddleware);

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
    });
  });

  // ============================================================================
  // API Routes - With Security
  // ============================================================================
  app.use('/api/auth', authRoutes);
  app.use('/api/packages', packageRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/blog', blogRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/users/wishlist', wishlistRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/itineraries', itineraryRoutes);
  app.use('/api/custom-trips', customTripRoutes);
  app.use('/api/translate', translationRoutes);
  app.use('/api/monitoring', monitoringRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
};

/**
 * إنشاء HTTP server مع WebSocket support
 */
export const createAppWithWebSocket = (): { app: Express; webSocket: WebSocketService; server: any } => {
  const app = createApp();
  const httpServer = createServer(app);
  
  // 🔧 Set long timeout for large file uploads (packages with images)
  httpServer.timeout = 120000; // 120 seconds
  httpServer.keepAliveTimeout = 65000; // Slightly less than the timeout
  httpServer.headersTimeout = 66000; // Slightly more than keepAliveTimeout
  
  const webSocket = new WebSocketService(httpServer);

  return { app, webSocket, server: httpServer };
};
