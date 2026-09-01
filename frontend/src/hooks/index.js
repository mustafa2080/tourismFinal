// Custom Hooks Export File
// Export all hooks from a central location for easier imports

export { useAuth } from './useAuth';
export { usePackages } from './usePackages';
export { useBooking } from './useBooking';
export { useMyBookings } from './useMyBookings';
export { useAdvancedStats } from './useAdvancedStats';
export { useAddons } from './useAddons';
export { useWishlist } from './useWishlist';
export { useItinerary } from './useItinerary';
export { useSearchFilters } from './useSearchFilters';
export { usePagination } from './usePagination';
export { useNotifications } from './useNotifications';
export { useAsync, useAsyncWithRetry, useAsyncDebounced } from './useAsync';
export { useLocalStorage, useLocalStorageObject, useLocalStorageArray, useLocalStorageMulti } from './useLocalStorage';
export { useDebounce, useDebounceCallback, useDebouncedSearch, useDebouncedValidation, useDebouncedAPI } from './useDebounce';
export { useFormValidation } from './useFormValidation';

// Context Hooks
export { useNotificationContext, useGlobalNotifications } from './useNotificationContext';
export { useTheme, useThemeContext } from './useTheme';
export { useCart, useCartContext } from './useCart';
export { useWishlistContext } from './useWishlistContext';
export { useLanguage } from './useLanguage';

// Translation Hooks - Optimized & Unified
export { useTranslation } from './useTranslation';
export { useInstantTranslation } from './useInstantTranslation';
export { useLanguageSync } from './useLanguageSync';
export { useTranslations } from './useTranslations';
export { useInstantTranslateWithLibre } from './useLibreTranslate';
export { useTranslatedPackages } from './useTranslatedPackages';

// Package Display Hooks
export { usePackageDisplay, usePackageListDisplay } from './usePackageDisplay';

// Currency Conversion Hook
export { useCurrencyConversion } from './useCurrencyConversion';

// Usage:
// import { useAuth, useBooking, useWishlist } from './hooks';
// import { useTheme, useCart } from './hooks';
// import { useInstantTranslation } from './hooks'; // للترجمة الفورية
// import { useCurrencyConversion } from './hooks'; // لتحويل العملات
// import { useFormValidation } from './hooks'; // للـ real-time form validation
// OR
// import * as hooks from './hooks';
