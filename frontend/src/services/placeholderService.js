/**
 * Image Placeholder Service
 * Provides fallback images for packages without image data
 */

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop&q=80', // Travel
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&q=80', // Beach
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80', // Mountain
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop&q=80', // City
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop&q=80', // Landscape
  'https://images.unsplash.com/photo-1485365881291-83100db2b90c?w=400&h=300&fit=crop&q=80', // Desert
  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop&q=80', // Ocean
  'https://images.unsplash.com/photo-1488250254773-41313bdc31f2?w=400&h=300&fit=crop&q=80', // Hotel
];

/**
 * Get a deterministic placeholder image based on package ID
 * @param {string} packageId - Package ID
 * @returns {string} - Placeholder image URL
 */
export function getPlaceholderImage(packageId) {
  if (!packageId) return PLACEHOLDER_IMAGES[0];
  
  // Generate hash from packageId to get consistent image
  let hash = 0;
  for (let i = 0; i < packageId.length; i++) {
    const char = packageId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  const index = Math.abs(hash) % PLACEHOLDER_IMAGES.length;
  return PLACEHOLDER_IMAGES[index];
}

/**
 * Get placeholder image based on package destination
 * @param {string} destination - Package destination
 * @returns {string} - Placeholder image URL
 */
export function getDestinationPlaceholder(destination = '') {
  if (!destination) return PLACEHOLDER_IMAGES[0];
  
  const dest = destination.toLowerCase();
  
  // Beach destinations
  if (dest.includes('beach') || dest.includes('coast') || dest.includes('sea')) {
    return PLACEHOLDER_IMAGES[1];
  }
  
  // Mountain destinations
  if (dest.includes('mountain') || dest.includes('peak') || dest.includes('alpine')) {
    return PLACEHOLDER_IMAGES[2];
  }
  
  // City destinations
  if (dest.includes('city') || dest.includes('cairo') || dest.includes('london')) {
    return PLACEHOLDER_IMAGES[3];
  }
  
  // Desert destinations
  if (dest.includes('desert') || dest.includes('sand') || dest.includes('luxor')) {
    return PLACEHOLDER_IMAGES[5];
  }
  
  // Default travel image
  return PLACEHOLDER_IMAGES[0];
}

export const placeholderService = {
  getPlaceholderImage,
  getDestinationPlaceholder,
  PLACEHOLDER_IMAGES,
};
