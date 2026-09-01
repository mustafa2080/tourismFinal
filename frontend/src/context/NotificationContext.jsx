import { createContext, useState, useCallback, useEffect, useMemo } from 'react';
import Cookies from 'js-cookie';
import { socketService, notificationsService } from '../services';
import { registerSafeListeners, removeSafeListeners } from '../utils/socketEventHandler.js';

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initDone, setInitDone] = useState(false);

  /**
   * Add new notification to state
   */
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  /**
   * Setup real-time socket listeners safely
   */
  const setupSocketListeners = useCallback(() => {
    const socket = socketService.getSocket();
    
    if (!socket) {
      console.warn('Socket not initialized yet, will retry when socket is ready');
      return;
    }

    // Check if listeners are already set up (prevent duplicates)
    if (socket._notificationsSetup) {
      console.log('Socket listeners already set up');
      return;
    }

    console.log('Setting up socket listeners for notifications');

    // Mark that listeners are set up
    socket._notificationsSetup = true;

    // Register all listeners safely (no async/promises)
    registerSafeListeners(socket, {
      'notification': (data) => {
        if (data) addNotification(data);
      },
      'booking:created': (data) => {
        if (data?.id) {
          addNotification({
            id: `booking-${data.id}-${Date.now()}`,
            type: 'booking_created',
            title: 'Booking Created',
            message: `Your booking #${data.bookingNumber} has been created`,
            data,
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
      },
      'booking:confirmed': (data) => {
        if (data?.id) {
          addNotification({
            id: `booking-${data.id}-confirmed-${Date.now()}`,
            type: 'booking_confirmed',
            title: 'Booking Confirmed',
            message: `Your booking #${data.bookingNumber} is confirmed!`,
            data,
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
      },
      'booking:cancelled': (data) => {
        if (data?.id) {
          addNotification({
            id: `booking-${data.id}-cancelled-${Date.now()}`,
            type: 'booking_cancelled',
            title: 'Booking Cancelled',
            message: `Your booking #${data.bookingNumber} has been cancelled`,
            data,
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
      },
      'payment:received': (data) => {
        if (data?.bookingId) {
          addNotification({
            id: `payment-${data.bookingId}-${Date.now()}`,
            type: 'payment_received',
            title: 'Payment Received',
            message: `Payment received for booking #${data.bookingNumber}`,
            data,
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
      },
      'review:approved': (data) => {
        if (data?.reviewId) {
          addNotification({
            id: `review-${data.reviewId}-approved-${Date.now()}`,
            type: 'review_approved',
            title: 'Review Approved',
            message: 'Your review has been approved and published',
            data,
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
      },
      'admin:message': (data) => {
        if (data?.id) {
          addNotification({
            id: `admin-${data.id}-${Date.now()}`,
            type: 'admin_message',
            title: data.subject || 'Message from Admin',
            message: data.message,
            data,
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
      }
    });
  }, [addNotification]);

  /**
   * Initialize notifications and socket listeners
   */
  const initializeNotifications = useCallback(async () => {
    setLoading(true);
    
    try {
      // Fetch initial notifications
      try {
        const response = await notificationsService.getNotifications({ 
          limit: 50, 
          offset: 0 
        });
        
        // Handle different response formats
        const notifications = response?.data || response || [];
        setNotifications(notifications);
      } catch (err) {
        console.warn('⚠️ [NotificationContext] Failed to fetch notifications:', err.message);
        setNotifications([]);
      }

      // Fetch unread count
      try {
        const count = await notificationsService.getUnreadCount();
        setUnreadCount(count);
      } catch (err) {
        console.warn('⚠️ [NotificationContext] Failed to fetch unread count:', err.message);
        setUnreadCount(0);
      }

      // Setup Socket.IO listeners
      try {
        setupSocketListeners();
      } catch (err) {
        console.warn('⚠️ [NotificationContext] Failed to setup socket listeners:', err.message);
      }

      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to initialize notifications');
      console.error('❌ [NotificationContext] Initialization error:', err);
    } finally {
      setLoading(false);
    }
  }, [setupSocketListeners]);

  /**
   * Initialize notifications on mount - only once
   */
  useEffect(() => {
    let isMounted = true;
    let setupTimeout;

    // Skip if already initialized
    if (initDone) return;

    const initIfAuthenticated = async () => {
      try {
        // تحقق من وجود authToken في Cookies (الطريقة الصحيحة لتخزين الـ token)
        const authToken = Cookies.get('authToken');
        
        if (!authToken) {
          console.log('⚠️ [NotificationContext] No auth token found, skipping notification initialization');
          if (isMounted) {
            setLoading(false);
            setInitDone(true);
          }
          return;
        }
        
        if (isMounted) {
          await initializeNotifications();
          setInitDone(true);
        }
      } catch (error) {
        console.error('❌ [NotificationContext] Error during initialization:', error);
        if (isMounted) {
          setLoading(false);
          setInitDone(true);
        }
      }
    };

    // Add a small delay to ensure the auth context has fully initialized
    setupTimeout = setTimeout(() => {
      if (isMounted) {
        initIfAuthenticated();
      }
    }, 100);
    
    // Cleanup
    return () => {
      isMounted = false;
      if (setupTimeout) clearTimeout(setupTimeout);
      
      // Remove socket listeners safely on unmount
      try {
        const socket = socketService.getSocket();
        if (socket && socket.connected) {
          // Remove all notification-related listeners
          const eventNames = [
            'notification',
            'booking:created',
            'booking:confirmed',
            'booking:cancelled',
            'payment:received',
            'review:approved',
            'admin:message'
          ];
          
          eventNames.forEach(eventName => {
            socket.off(eventName);
          });
          
          socket._notificationsSetup = false;
          console.log('✅ Socket listeners cleaned up');
        }
      } catch (err) {
        console.warn('⚠️ Error during cleanup:', err.message);
      }
    };
  }, [initDone, initializeNotifications]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationsService.markAsRead(notificationId);

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, isRead: true }
            : notif
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsService.markAllAsRead();

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, []);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationsService.deleteNotification(notificationId);

      const notif = notifications.find(n => n.id === notificationId);
      if (notif && !notif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      setNotifications(prev =>
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, [notifications]);

  /**
   * Delete all notifications
   */
  const deleteAllNotifications = useCallback(async () => {
    try {
      await notificationsService.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to delete all notifications:', err);
    }
  }, []);

  /**
   * Get notifications by type
   */
  const getByType = useCallback((type) => {
    return notifications.filter(notif => notif.type === type);
  }, [notifications]);

  /**
   * Get unread notifications
   */
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(notif => !notif.isRead);
  }, [notifications]);

  /**
   * Archive notification
   */
  const archiveNotification = useCallback(async (notificationId) => {
    try {
      await notificationsService.archiveNotification(notificationId);
      
      const notif = notifications.find(n => n.id === notificationId);
      if (notif && !notif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      setNotifications(prev =>
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (err) {
      console.error('Failed to archive notification:', err);
    }
  }, [notifications]);

  /**
   * Refresh notifications from server
   */
  const refresh = useCallback(async () => {
    try {
      const response = await notificationsService.getNotifications({ 
        limit: 50, 
        offset: 0 
      });
      setNotifications(response || []);

      const count = await notificationsService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to refresh notifications:', err);
    }
  }, []);

  // ✅ Memoize value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // State
    notifications,
    unreadCount,
    loading,
    error,

    // Methods
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    archiveNotification,
    refresh,

    // Getters
    getByType,
    getUnreadNotifications,
    isEmpty: notifications.length === 0,
    hasUnread: unreadCount > 0
  }), [notifications, unreadCount, loading, error, addNotification, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications, archiveNotification, refresh, getByType, getUnreadNotifications]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export default NotificationContext;
