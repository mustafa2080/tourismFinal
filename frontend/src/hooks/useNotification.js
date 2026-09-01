/**
 * useNotification Hook
 * Custom hook for using Notification context
 */

import { useContext } from 'react';
import { NotificationContext } from '@/context/NotificationContext';

/**
 * Hook for using notification context
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      'useNotification must be used within NotificationProvider'
    );
  }

  return context;
};

export default useNotification;