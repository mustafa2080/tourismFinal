import toast from 'react-hot-toast';

/**
 * Show success toast notification
 */
export const showSuccessToast = (message, options = {}) => {
  toast.success(message, {
    duration: 4000,
    position: 'top-right',
    ...options,
  });
};

/**
 * Show error toast notification
 */
export const showErrorToast = (message, options = {}) => {
  toast.error(message, {
    duration: 4000,
    position: 'top-right',
    ...options,
  });
};

/**
 * Show loading toast notification
 */
export const showLoadingToast = (message, options = {}) => {
  return toast.loading(message, {
    position: 'top-right',
    ...options,
  });
};

/**
 * Show promise-based toast notification
 */
export const showPromiseToast = (promise, messages, options = {}) => {
  return toast.promise(promise, 
    {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'Error occurred',
    },
    {
      position: 'top-right',
      ...options,
    }
  );
};

/**
 * Show generic notification with custom type
 */
export const showNotificationToast = (notification) => {
  const {
    title,
    message,
    type = 'info',
    duration = 4000,
    action = null,
  } = notification;

  const fullMessage = title ? `${title}\n${message}` : message;

  if (type === 'success') {
    showSuccessToast(fullMessage, { duration });
  } else if (type === 'error') {
    showErrorToast(fullMessage, { duration });
  } else {
    toast(fullMessage, {
      duration,
      position: 'top-right',
      icon: type === 'warning' ? '⚠️' : 'ℹ️',
    });
  }
};

/**
 * Show booking notification
 */
export const showBookingNotification = (booking) => {
  const message = `Booking ${booking.booking_number || 'created'} successfully!`;
  showSuccessToast(message, { duration: 5000 });
};

/**
 * Show booking reminder notification
 */
export const showBookingReminderNotification = (booking, daysRemaining) => {
  let icon = '⏰';
  if (daysRemaining === 0) icon = '🔴';
  else if (daysRemaining === 1) icon = '🟠';

  const message = daysRemaining === 1
    ? `Your trip ${booking.package_title} is TOMORROW! 🎉`
    : `Your trip starts in ${daysRemaining} days ${icon}`;

  toast(message, {
    duration: 5000,
    position: 'top-right',
    icon,
  });
};

/**
 * Dismiss all toasts
 */
export const dismissAllToasts = () => {
  toast.dismiss();
};

/**
 * Dismiss specific toast by ID
 */
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};
