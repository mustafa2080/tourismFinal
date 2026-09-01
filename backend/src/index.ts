import 'dotenv/config';
import { createAppWithWebSocket } from './app.js';
import { initializeDatabase } from './config/connection.js';
import { initializeSystemSettings } from './config/initializeSettings.js';
import { initializeCategoryLinks } from './config/initializeCategoryLinks.js';
import { createPerformanceIndexes, analyzeTables } from './config/indexes.js';
import { CacheManager } from './config/cache.js';
import { setWebSocketService } from './websocket/index.js';
import { CronJobs } from './jobs/cronJobs.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('═══════════════════════════════════');
    console.log('🚀 TOUR BOOKING BACKEND');
    console.log('═══════════════════════════════════');
    console.log('');

    // تهيئة قاعدة البيانات
    console.log('📦 Step 1: Initializing Database...');
    console.log('[DEBUG] Calling initializeDatabase()...');
    await initializeDatabase();
    console.log('[DEBUG] Database initialization complete!');
    console.log('✅ Database initialized');
    console.log('');

    // تهيئة Performance Indexes
    console.log('📦 Step 1.2: Creating Performance Indexes...');
    try {
      await createPerformanceIndexes();
      await analyzeTables();
      console.log('✅ Performance indexes created');
    } catch (indexError) {
      console.warn('⚠️ Performance indexes skipped:', indexError);
    }
    console.log('');

    // تهيئة Redis Cache
    console.log('📦 Step 1.3: Initializing Cache System...');
    try {
      const cache = CacheManager.getInstance();
      await cache.connect();
      console.log('✅ Cache system initialized');
    } catch (cacheError) {
      console.warn('⚠️ Cache system failed, continuing without cache:', cacheError);
    }
    console.log('');

    // تهيئة System Settings
    console.log('📦 Step 1.5: Initializing System Settings...');
    console.log('[DEBUG] Calling initializeSystemSettings()...');
    try {
      await initializeSystemSettings();
      console.log('[DEBUG] System settings initialization complete!');
      console.log('✅ System settings initialized');
    } catch (settingsError) {
      console.warn('[DEBUG] Warning: System settings initialization failed:', settingsError);
      console.log('⚠️  System settings skipped, continuing...');
    }
    console.log('');

    // تهيئة Category Links
    console.log('📦 Step 1.6: Initializing Package-Category Links...');
    try {
      await initializeCategoryLinks();
      console.log('✅ Category links initialized');
    } catch (categoryError) {
      console.warn('[DEBUG] Warning: Category links initialization failed:', categoryError);
      console.log('⚠️  Category links skipped, continuing...');
    }
    console.log('');

    // إنشاء Express app مع WebSocket
    console.log('📦 Step 2: Setting up Server...');
    console.log('[DEBUG] Creating app with websocket...');
    const { app, webSocket, server } = createAppWithWebSocket();
    console.log('[DEBUG] App created successfully');
    console.log('✅ Server configured');
    console.log('');

    // تسجيل الخدمة العالمية للـ WebSocket
    console.log('[DEBUG] Setting websocket service...');
    setWebSocketService(webSocket);
    console.log('[DEBUG] WebSocket service set');
    console.log('✅ WebSocket service set');

    // بدء الـ Cron Jobs
    console.log('[DEBUG] Starting cron jobs...');
    try {
      CronJobs.startAll();
      console.log('[DEBUG] Cron jobs started');
      console.log('✅ Cron jobs started');
    } catch (cronError) {
      console.warn('[DEBUG] Warning: Cron jobs failed but continuing:', cronError);
      console.log('⚠️ Cron jobs skipped, continuing...');
    }
    console.log('');

    // بدء الـ server
    console.log('📦 Step 3: Starting Server...');
    console.log(`[DEBUG] Attempting to listen on port ${PORT}...`);
    console.log(`[DEBUG] PORT Type: ${typeof PORT}, PORT Value: "${PORT}"`);
    
    // تأكد من أن PORT قيمة صحيحة
    const portNumber = parseInt(String(PORT), 10);
    console.log(`[DEBUG] Parsed PORT: ${portNumber}`);
    if (isNaN(portNumber)) {
      throw new Error(`Invalid PORT: ${PORT}`);
    }
    
    console.log('[DEBUG] Starting HTTP server listen...');
    const serverInstance = server.listen(portNumber, '0.0.0.0', () => {
      const address = serverInstance.address();
      console.log('Server address:', address);
      console.log('');
      console.log('═══════════════════════════════════');
      console.log('✅ SERVER STARTED SUCCESSFULLY');
      console.log('═══════════════════════════════════');
      console.log('');
      console.log(`🌐 API:        http://localhost:${portNumber}`);
      console.log(`📊 Health:     http://localhost:${portNumber}/health`);
      console.log(`🔌 WebSocket:  ws://localhost:${portNumber}`);
      console.log(`🔐 Auth:       http://localhost:${portNumber}/api/auth`);
      console.log('');
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
      console.log(`🗄️  Database:    ${process.env.DB_NAME || 'tour'}`);
      console.log('');
      console.log('═══════════════════════════════════');
      console.log('Press Ctrl+C to stop the server');
      console.log('═══════════════════════════════════');
      console.log('');
    }).on('error', (err: any) => {
      console.error('❌ Server listen error:', err);
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${portNumber} is already in use.`);
        console.error(`   💡 Solutions:`);
        console.error(`      1. Kill the process using this port:`);
        console.error(`         netstat -ano | findstr :${portNumber}  (Windows)`);
        console.error(`         lsof -i :${portNumber}  (Mac/Linux)`);
        console.error(`      2. Or change the PORT in .env file`);
      }
      process.exit(1);
    });

    console.log('[DEBUG] HTTP server listening, waiting for connections...');

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('');
      console.log('💤 Shutting down gracefully...');
      webSocket.close();
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('');
    console.error('╔═══════════════════════════════════╗');
    console.error('║  ❌ FAILED TO START SERVER        ║');
    console.error('╚═══════════════════════════════════╝');
    console.error('');
    console.error('Error:', error);
    console.error('');
    console.error('🔍 Troubleshooting:');
    console.error('   1. ✅ Check PostgreSQL is running');
    console.error('   2. ✅ Check database "tour" exists');
    console.error('   3. ✅ Check .env file configuration');
    console.error('   4. ✅ Check port 5000 is not in use');
    console.error('');
    console.error('Commands to try:');
    console.error('   # Create database:');
    console.error('   psql -U postgres -c "CREATE DATABASE tour;"');
    console.error('');
    console.error('   # Check PostgreSQL:');
    console.error('   psql -U postgres -d tour -c "SELECT 1;"');
    console.error('');
    process.exit(1);
  }
}

console.log('[DEBUG 0] Starting startServer()...');
console.log(`[DEBUG 0] Node Version: ${process.version}`);
console.log(`[DEBUG 0] Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`[DEBUG 0] .env PORT: ${process.env.PORT}`);

startServer().catch((error) => {
  console.error('[DEBUG FATAL] Uncaught error in startServer:', error);
  process.exit(1);
});