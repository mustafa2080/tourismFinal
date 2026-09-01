/**
 * Notification Navigation Utility
 * Maps notification types and payloads to navigation paths
 */

export const getNavigationPathFromNotification = (notification) => {
  if (!notification) {
    console.warn('⚠️ No notification provided');
    return '/dashboard';
  }

  const { type, payload } = notification;

  if (!type) {
    console.warn('⚠️ No type in notification:', notification);
    return '/dashboard';
  }

  console.log('🔍 [notificationNavigation] Processing:', {
    type,
    payload,
  });

  // Extract IDs from various possible fields
  const bookingId = payload?.bookingId || payload?.relatedId;
  const packageId = payload?.packageId;
  const refundId = payload?.refundId;
  const messageId = payload?.messageId;

  let path = '';

  // Booking-related notifications
  if (type.includes('booking')) {
    if (bookingId) {
      path = `/dashboard/bookings/${bookingId}`;
      console.log('📚 Booking notification → Path:', path);
    } else {
      console.warn('⚠️ Booking notification but no bookingId found');
      path = '/dashboard/bookings';
    }
  }
  // Payment-related notifications
  else if (type.includes('payment')) {
    if (bookingId) {
      path = `/dashboard/bookings/${bookingId}`;
      console.log('💳 Payment notification → Path:', path);
    } else {
      path = '/dashboard/bookings';
    }
  }
  // Review-related notifications
  else if (type.includes('review')) {
    if (packageId) {
      path = `/packages/${packageId}`;
      console.log('⭐ Review notification → Path:', path);
    } else {
      path = '/dashboard';
    }
  }
  // Wishlist-related notifications
  else if (type.includes('wishlist')) {
    if (packageId) {
      path = `/packages/${packageId}`;
      console.log('❤️ Wishlist notification → Path:', path);
    } else {
      path = '/dashboard/wishlist';
    }
  }
  // Refund-related notifications
  else if (type.includes('refund')) {
    if (refundId) {
      path = `/dashboard/refunds/${refundId}`;
      console.log('💰 Refund notification → Path:', path);
    } else if (bookingId) {
      path = `/dashboard/bookings/${bookingId}`;
    } else {
      path = '/dashboard';
    }
  }
  // Message/Chat notifications
  else if (type.includes('message') || type.includes('contact')) {
    if (messageId) {
      path = `/admin/contact/${messageId}`;
    } else {
      path = '/admin/contact';
    }
    console.log('💬 Message notification → Path:', path);
  }
  // Admin alerts
  else if (type.includes('admin')) {
    path = '/admin';
    console.log('🔔 Admin notification → Path:', path);
  }
  // Default case
  else {
    console.log('❓ Unknown notification type:', type);
    path = '/dashboard';
  }

  console.log('🎯 Final navigation path:', path);
  return path;
};

/**
 * Check if a notification should trigger navigation
 */
export const shouldNavigateFromNotification = (notification) => {
  const path = getNavigationPathFromNotification(notification);
  return path && path !== '/dashboard';
};

/**
 * Get user-friendly title for notification type
 */
export const getNotificationTypeLabel = (type) => {
  const typeLabels = {
    'booking:created': 'Booking Confirmed',
    'booking:confirmed': 'Booking Confirmed',
    'booking:cancelled': 'Booking Cancelled',
    'booking:reminder': 'Trip Reminder',
    'payment:received': 'Payment Received',
    'payment:failed': 'Payment Failed',
    'payment:pending': 'Payment Pending',
    'review:approved': 'Review Published',
    'review:rejected': 'Review Rejected',
    'review:received': 'New Review',
    'wishlist:item_available': 'Wishlist Item Available',
    'refund:processed': 'Refund Processed',
    'refund:initiated': 'Refund Initiated',
    'message:new': 'New Message',
    'contact:response': 'Contact Response',
    'admin:alert': 'Admin Alert',
  };

  return typeLabels[type] || type || 'Notification';
};
