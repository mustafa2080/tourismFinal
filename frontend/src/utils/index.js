/**
 * Central export file for all utilities
 * Makes it easier to import utilities throughout the app
 */

export * from './validators';
export * from './formatters';
export * from './date-utils';
export * from './price-calculator';
export * from './storage';
export * from './helpers';
export * from './itineraryUtils';
export * from './imageCompression';

// Import tokenManager as default export
export { default as tokenManager } from './tokenManager';

// For convenience, export everything as objects too
import * as validators from './validators';
import * as formatters from './formatters';
import * as dateUtils from './date-utils';
import * as priceCalculator from './price-calculator';
import * as storage from './storage';
import * as helpers from './helpers';
import * as itineraryUtils from './itineraryUtils';
import * as imageUtils from './imageCompression';
import tokenManager from './tokenManager';

export { dateUtils, itineraryUtils, imageUtils };

export const utils = {
  validators,
  formatters,
  dateUtils,
  priceCalculator,
  storage,
  helpers,
  tokenManager,
  itineraryUtils
};