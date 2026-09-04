/**
 * Itinerary Utilities
 * Helper functions for processing itinerary data
 */

/**
 * Parse activities string to array
 * Handles multiple formats: comma-separated, newline-separated, or array
 */
export const parseActivities = (activities) => {
  if (!activities) return [];
  if (Array.isArray(activities)) return activities;
  if (typeof activities === 'string') {
    return activities
      .split(/,|\n/)
      .map(a => a.trim())
      .filter(a => a.length > 0);
  }
  return [];
};

/**
 * Parse meals string to array
 * Returns meal objects with type and name
 */
export const parseMeals = (meals) => {
  if (!meals) return [];
  if (Array.isArray(meals)) return meals;
  if (typeof meals === 'string') {
    return meals
      .split(',')
      .map(m => m.trim())
      .filter(m => m.length > 0)
      .map(m => ({
        name: m,
        type: getMealType(m),
      }));
  }
  return [];
};

/**
 * Determine meal type from meal name
 */
export const getMealType = (mealName) => {
  const lower = mealName.toLowerCase();
  if (lower.includes('breakfast')) return 'breakfast';
  if (lower.includes('lunch')) return 'lunch';
  if (lower.includes('dinner')) return 'dinner';
  if (lower.includes('brunch')) return 'brunch';
  if (lower.includes('snack')) return 'snack';
  return 'meal';
};

/**
 * Get meal color for UI display
 */
export const getMealColor = (mealType) => {
  const typeMap = {
    breakfast: { bg: 'bg-yellow-100', text: 'text-yellow-800', dark: 'dark:bg-yellow-900/30 dark:text-yellow-200' },
    lunch: { bg: 'bg-teal-100', text: 'text-teal-800', dark: 'dark:bg-teal-900/30 dark:text-teal-200' },
    dinner: { bg: 'bg-orange-100', text: 'text-orange-800', dark: 'dark:bg-orange-900/30 dark:text-orange-200' },
    brunch: { bg: 'bg-orange-100', text: 'text-orange-800', dark: 'dark:bg-orange-900/30 dark:text-orange-200' },
    snack: { bg: 'bg-green-100', text: 'text-green-800', dark: 'dark:bg-green-900/30 dark:text-green-200' },
  };
  
  return typeMap[mealType] || typeMap.meal || { bg: 'bg-slate-100', text: 'text-slate-800', dark: 'dark:bg-slate-700 dark:text-slate-200' };
};

/**
 * Format itinerary for display
 */
export const formatItinerary = (itinerary) => {
  return {
    ...itinerary,
    activities: parseActivities(itinerary.activities),
    meals: parseMeals(itinerary.meals),
  };
};

/**
 * Format multiple itineraries
 */
export const formatItineraries = (itineraries) => {
  return itineraries.map(formatItinerary).sort((a, b) => a.day_number - b.day_number);
};

/**
 * Get itinerary summary
 */
export const getItinerarySummary = (itinerary) => {
  const activities = parseActivities(itinerary.activities);
  const meals = parseMeals(itinerary.meals);
  
  return {
    day: itinerary.day_number,
    title: itinerary.title,
    activities: activities.length,
    meals: meals.length,
    hasImage: !!itinerary.image_url,
  };
};

/**
 * Group itineraries by day range
 */
export const groupItinerariesByRange = (itineraries, daysPerGroup = 3) => {
  const groups = [];
  let currentGroup = [];

  itineraries.forEach((itinerary) => {
    currentGroup.push(itinerary);
    
    if (currentGroup.length === daysPerGroup) {
      groups.push({
        days: currentGroup.map(i => i.day_number),
        itineraries: currentGroup,
        range: `Day ${currentGroup[0].day_number} - Day ${currentGroup[currentGroup.length - 1].day_number}`,
      });
      currentGroup = [];
    }
  });

  if (currentGroup.length > 0) {
    groups.push({
      days: currentGroup.map(i => i.day_number),
      itineraries: currentGroup,
      range: `Day ${currentGroup[0].day_number} - Day ${currentGroup[currentGroup.length - 1].day_number}`,
    });
  }

  return groups;
};

export default {
  parseActivities,
  parseMeals,
  getMealType,
  getMealColor,
  formatItinerary,
  formatItineraries,
  getItinerarySummary,
  groupItinerariesByRange,
};
