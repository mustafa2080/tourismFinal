// Services Export File
// Export all services from a central location for easier imports

export { authService } from './authService';
export { packagesService } from './packagesService';
export { bookingsService } from './bookingsService';
export { wishlistService } from './wishlistService';
export { reviewsService } from './reviewsService';
export { notificationsService } from './notificationsService';
export { blogService } from './blogService';
export { adminService } from './adminService';
export { uploadService } from './uploadService';
export { analyticsService } from './analyticsService';
export { socketService } from './socketService';
export { reportService } from './reportService';
export { default as categoryService } from './categoryService';
export { default as itineraryService } from './itineraryService';
export { default as customTripService } from './customTripService';
export { default as addonsService } from './addonsService';
export { default as apiClient } from './apiClient';
export { translationManager } from './translationManager';
export { default as currencyService } from './currencyService';

// Usage:
// import { authService, packagesService, wishlistService, currencyService } from './services';
// OR
// import * as services from './services';
