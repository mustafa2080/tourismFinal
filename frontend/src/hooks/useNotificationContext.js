import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

/**
 * Custom hook to use NotificationContext
 */
export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error(
      'useNotificationContext must be used within NotificationProvider'
    );
  }
  
  return context;
};

// Alias for easier imports
export const useGlobalNotifications = useNotificationContext;
