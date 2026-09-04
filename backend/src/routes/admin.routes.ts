import { Router } from 'express';
import { AdminController } from '../controllers/AdminController.js';
import { RefundController } from '../controllers/RefundController.js';
import { ItineraryAdminController } from '../controllers/ItineraryAdminController.js';
import { StatsController } from '../controllers/StatsController.js';
import { ContactController } from '../controllers/ContactController.js';
import { CustomTripController } from '../controllers/CustomTripController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { AppDataSource } from '../config/connection.js';
import { Booking } from '../entities/Booking.js';
import { ContactSubmission } from '../entities/ContactSubmission.js';

const router = Router();

// Lazy initialization
const getAdminController = () => new AdminController();
const getRefundController = () => new RefundController();
const getItineraryAdminController = () => new ItineraryAdminController();
const getStatsController = () => new StatsController();
const getContactController = () => new ContactController();
const getCustomTripController = () => new CustomTripController();

// All admin routes require authentication and admin role
router.use(authMiddleware, adminMiddleware);

// User Management
router.get('/users', (req, res, next) =>
  getAdminController().getAllUsers(req, res, next)
);

router.get('/users/:userId', (req, res, next) =>
  getAdminController().getUserById(req, res, next)
);

router.post('/users/:userId/ban', (req, res, next) =>
  getAdminController().banUser(req, res, next)
);

// Booking Management
router.get('/bookings', (req, res, next) =>
  getAdminController().getAllBookings(req, res, next)
);

router.get('/bookings/stats', (req, res, next) =>
  getAdminController().getBookingStats(req, res, next)
);

router.get('/bookings/status/:status', (req, res, next) =>
  getAdminController().getBookingsByStatus(req, res, next)
);

router.post('/bookings/:bookingId/cancel', (req, res, next) =>
  getAdminController().cancelTrip(req, res, next)
);

// Review Management
router.get('/reviews/pending', (req, res, next) =>
  getAdminController().getPendingReviews(req, res, next)
);

// Reports & Analytics
router.get('/reports/revenue', (req, res, next) =>
  getAdminController().getRevenueReport(req, res, next)
);

router.get('/reports/top-packages', (req, res, next) =>
  getAdminController().getTopPackages(req, res, next)
);

router.get('/reports/customers', (req, res, next) =>
  getAdminController().getCustomerStats(req, res, next)
);

router.get('/reports/bookings', (req, res, next) =>
  getAdminController().getBookingStats(req, res, next)
);

// Debug endpoint - to check all bookings in DB
router.get('/reports/debug/all-bookings', (req, res, next) => {
  const bookingRepository = AppDataSource.getRepository(Booking);
  bookingRepository.find().then(bookings => {
    res.json({
      success: true,
      totalBookings: bookings.length,
      bookings: bookings.slice(0, 5).map(b => ({
        id: b.id,
        status: b.status,
        total_price: b.total_price,
        created_at: b.created_at,
      }))
    });
  }).catch(err => next(err));
});

// Audit Logs
router.get('/logs/audit', (req, res, next) =>
  getAdminController().getAuditLogs(req, res, next)
);

// Refund Management
router.get('/bookings/for-refund', (req, res, next) =>
  getRefundController().getBookingsForRefund(req, res, next)
);

router.post('/bookings/:bookingId/refund', (req, res, next) =>
  getRefundController().issueRefund(req, res, next)
);

router.put('/bookings/:bookingId/refund/status', (req, res, next) =>
  getRefundController().updateRefundStatus(req, res, next)
);

router.post('/bookings/:bookingId/refund/reject', (req, res, next) =>
  getRefundController().rejectRefund(req, res, next)
);

router.get('/refunds', (req, res, next) =>
  getRefundController().getRefunds(req, res, next)
);

router.get('/refunds/stats', (req, res, next) =>
  getRefundController().getRefundStats(req, res, next)
);

// Package Management (Tours)
router.get('/packages', (req, res, next) =>
  getAdminController().getAllPackages(req, res, next)
);

router.post('/packages', (req, res, next) =>
  getAdminController().createPackage(req, res, next)
);

router.get('/packages/:id', (req, res, next) =>
  getAdminController().getPackageById(req, res, next)
);

router.put('/packages/:id', (req, res, next) =>
  getAdminController().updatePackage(req, res, next)
);

router.delete('/packages/:id', (req, res, next) =>
  getAdminController().deletePackage(req, res, next)
);

// Add-ons Management
router.get('/addons', (req, res, next) =>
  getAdminController().getAllAddons(req, res, next)
);

router.get('/addons/stats', (req, res, next) =>
  getAdminController().getAddonsStats(req, res, next)
);

// Itinerary Management - Fill missing translations
router.post('/itineraries/fill-translations', (req, res, next) =>
  getItineraryAdminController().fillMissingTranslations(req, res, next)
);

// 📊 ADVANCED DASHBOARD STATS ENDPOINTS
router.get('/stats/dashboard', (req, res, next) =>
  getStatsController().getDashboardStats(req, res, next)
);

router.get('/stats/revenue-trend', (req, res, next) =>
  getStatsController().getRevenueTrend(req, res, next)
);

router.get('/stats/booking-distribution', (req, res, next) =>
  getStatsController().getBookingDistribution(req, res, next)
);

router.get('/stats/user-growth', (req, res, next) =>
  getStatsController().getUserGrowth(req, res, next)
);

// Debug endpoint - Check all bookings
router.get('/debug/bookings-count', async (req, res, next) => {
  try {
    const { AppDataSource } = await import('../config/connection.js');
    const { Booking } = await import('../entities/Booking.js');
    
    const bookingRepo = AppDataSource.getRepository(Booking);
    const totalCount = await bookingRepo.count();
    const allBookings = await bookingRepo.find({ take: 5 });
    
    console.log('🔍 Debug: Total bookings:', totalCount);
    
    res.json({
      success: true,
      totalBookings: totalCount,
      sample: allBookings.map(b => ({
        id: b.id,
        status: b.status,
        price: b.total_price,
        created: b.created_at,
      }))
    });
  } catch (err) {
    next(err);
  }
});

// Fix endpoint - Link packages with categories
router.post('/fix/link-packages-categories', async (req, res, next) => {
  try {
    console.log('🔄 [Admin API] Starting package-category linking...');
    
    const { AppDataSource } = await import('../config/connection.js');
    const { Package } = await import('../entities/Package.js');
    const { Category } = await import('../entities/Category.js');

    const packageRepo = AppDataSource.getRepository(Package);
    const categoryRepo = AppDataSource.getRepository(Category);

    // Get all packages
    const allPackages = await packageRepo.find({ relations: ['categories'] });
    console.log(`📦 [Admin API] Found ${allPackages.length} total packages`);

    // Define category mappings
    const categoryMappings: { [key: string]: string[] } = {
      'Adventure': ['Mountain', 'Adventure'],
      'Beach': ['Beach', 'Honeymoon'],
      'Cultural': ['Cultures'],
      'Honeymoon': ['Honeymoon', 'Beach'],
      'Family': ['Family', 'Beach'],
      'Mountain': ['Mountain', 'Adventure'],
      'Tokyo': ['Cultures', 'Adventure'],
      'Paris': ['Cultures', 'Honeymoon'],
      'Dubai': ['Beach', 'Family'],
      'Balloon': ['Adventure', 'Family'],
    };

    let linkedCount = 0;
    let skippedCount = 0;
    const linkedPackages: any[] = [];

    for (const pkg of allPackages) {
      // Skip if already has categories
      if (pkg.categories && pkg.categories.length > 0) {
        console.log(`⏭️  Package "${pkg.title}" already has ${pkg.categories.length} categories`);
        skippedCount++;
        continue;
      }

      try {
        // Find matching categories
        const categoriesToLink: InstanceType<typeof Category>[] = [];
        const categoryNames = new Set<string>();

        const searchText = `${pkg.title} ${pkg.destination}`.toLowerCase();
        
        for (const [keyword, categoryNameList] of Object.entries(categoryMappings)) {
          if (searchText.includes(keyword.toLowerCase())) {
            categoryNameList.forEach(name => categoryNames.add(name));
          }
        }

        // Default mapping if no categories found
        if (categoryNames.size === 0) {
          if (pkg.trip_type) {
            const tripTypeMap: { [key: string]: string } = {
              'adventure': 'Adventure',
              'beach': 'Beach',
              'cultural': 'Cultures',
              'honeymoon': 'Honeymoon',
              'family': 'Family',
            };
            const catName = tripTypeMap[pkg.trip_type.toLowerCase()] || 'Adventure';
            categoryNames.add(catName);
          } else {
            categoryNames.add('Adventure');
          }
        }

        // Fetch category objects
        for (const catName of categoryNames) {
          const category = await categoryRepo.findOne({ where: { name: catName } });
          if (category) {
            categoriesToLink.push(category);
          }
        }

        if (categoriesToLink.length > 0) {
          pkg.categories = categoriesToLink;
          await packageRepo.save(pkg);
          console.log(`✅ Linked "${pkg.title}" to ${categoriesToLink.length} categories`);
          linkedCount++;
          linkedPackages.push({
            id: pkg.id,
            title: pkg.title,
            categories: categoriesToLink.map(c => c.name)
          });
        }
      } catch (error) {
        console.error(`❌ Error linking package "${pkg.title}":`, error);
      }
    }

    res.json({
      success: true,
      message: 'Package-category linking completed',
      stats: {
        linked: linkedCount,
        skipped: skippedCount,
        total: linkedCount + skippedCount
      },
      linkedPackages: linkedPackages.slice(0, 5)
    });
  } catch (error) {
    console.error('❌ [Admin API] Linking error:', error);
    next(error);
  }
});

// ============================================================================
// CONTACT MESSAGE MANAGEMENT - Admin Routes
// ============================================================================

// ⚠️ IMPORTANT: Status routes MUST come before /:id route
router.get('/contact/stats/pending', (req, res, next) =>
  getContactController().getPendingCount(req, res, next)
);

router.get('/contact/status/:status', (req, res, next) =>
  getContactController().getSubmissionsByStatus(req, res, next)
);

router.put('/contact/:id/status', (req, res, next) =>
  getContactController().updateSubmissionStatus(req, res, next)
);

router.get('/contact', (req, res, next) =>
  getContactController().getAllSubmissions(req, res, next)
);

router.get('/contact/:id', (req, res, next) =>
  getContactController().getSubmissionById(req, res, next)
);

router.delete('/contact/:id', (req, res, next) =>
  getContactController().deleteSubmission(req, res, next)
);

// ============================================================================
// CUSTOM TRIPS MANAGEMENT - Admin Routes
// ============================================================================

// ⚠️ Stats/options routes MUST come before /:id route
router.get('/custom-trips/stats', (req, res, next) =>
  getCustomTripController().getStats(req, res, next)
);

// Trip Builder catalog (activities/hotels/transport/meals) CRUD
router.get('/custom-trips/options', (req, res, next) =>
  getCustomTripController().getOptionsAdmin(req, res, next)
);

router.post('/custom-trips/options', (req, res, next) =>
  getCustomTripController().createOption(req, res, next)
);

router.put('/custom-trips/options/:id', (req, res, next) =>
  getCustomTripController().updateOption(req, res, next)
);

router.delete('/custom-trips/options/:id', (req, res, next) =>
  getCustomTripController().deleteOption(req, res, next)
);

// Custom trip requests
router.get('/custom-trips', (req, res, next) =>
  getCustomTripController().getAllAdmin(req, res, next)
);

router.get('/custom-trips/:id', (req, res, next) =>
  getCustomTripController().getById(req, res, next)
);

router.put('/custom-trips/:id/status', (req, res, next) =>
  getCustomTripController().updateStatus(req, res, next)
);

router.post('/custom-trips/:id/quote', (req, res, next) =>
  getCustomTripController().sendQuote(req, res, next)
);

router.delete('/custom-trips/:id', (req, res, next) =>
  getCustomTripController().deleteRequest(req, res, next)
);

export default router;
