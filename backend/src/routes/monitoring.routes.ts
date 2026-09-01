import { Router } from 'express';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import MonitoringController from '../controllers/MonitoringController.js';

const router = Router();

/**
 * Health Check Endpoint (Public)
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

/**
 * System Health and Performance (Admin Only)
 */
router.get('/system-health', adminMiddleware, MonitoringController.getSystemHealth.bind(MonitoringController));

/**
 * Performance Metrics (Admin Only)
 */
router.get('/metrics', adminMiddleware, MonitoringController.getPerformanceMetrics.bind(MonitoringController));

/**
 * Cache Statistics (Admin Only)
 */
router.get('/cache-stats', adminMiddleware, MonitoringController.getCacheStats.bind(MonitoringController));

/**
 * Clear Cache (Admin Only)
 */
router.post('/cache/clear', adminMiddleware, MonitoringController.clearCache.bind(MonitoringController));

export default router;
