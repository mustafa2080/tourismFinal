/**
 * Safe date formatting utility
 * Handles various date formats and invalid dates gracefully
 */

export const formatBookingDate = (dateValue) => {
  if (!dateValue) return 'Not specified';

  try {
    // If it's already a string in YYYY-MM-DD format, parse it directly
    if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateValue.split('-');
      const date = new Date(year, parseInt(month) - 1, day);
      
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
      }
    }

    // Try parsing as date string or timestamp
    const date = new Date(dateValue);

    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }

    return 'Invalid Date';
  } catch (error) {
    console.error('Error formatting date:', dateValue, error);
    return 'Invalid Date';
  }
};

/**
 * Format date range for bookings
 */
export const formatDateRange = (startDate, endDate) => {
  const start = formatBookingDate(startDate);
  const end = formatBookingDate(endDate);

  if (start === 'Invalid Date' || end === 'Invalid Date') {
    return 'Date not available';
  }

  return `${start} - ${end}`;
};
