import { useEffect, useState, useCallback } from 'react';
import { socketService } from '../services/socketService';
import { notificationsService } from '../services/notificationsService';
import { showSuccessToast, showErrorToast } from '../utils/notifications';
import { useAuth } from './useAuth';

/**
 * Hook to manage notifications in real-time
 */
export const useNotifications = () => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize WebSocket listeners and fetch initial notifications
  useEffect(() => {
    let mounted = true;

    const initializeNotifications = async () => {
      if (!isAuthenticated || !user?.id) {
        console.log('⏭️ Skipping notifications - user not authenticated');
        return;
      }

      try {
        // Fetch initial notifications
        console.log('📬 Fetching initial notifications...');
        const response = await notificationsService.getNotifications({ limit: 20 });
        if (mounted) {
          setNotifications(response.data?.data || response.data || []);
          
          // Fetch unread count
          const count = await notificationsService.getUnreadCount();
          setUnreadCount(count);
        }
      } catch (err) {
        console.error('❌ Failed to fetch initial notifications:', err);
        if (mounted) {
          setError(err.message);
        }
      }

      // Setup WebSocket listeners
      const socket = socketService.getSocket();
      if (!socket?.connected) {
        console.warn('⚠️ Socket not connected, will retry on connection');
        return;
      }

      console.log('🔌 Setting up WebSocket listeners for notifications');

      // Subscribe user to notifications
      socket.emit('subscribe:user', user.id, (response) => {
        console.log('✅ Subscribed to user notifications:', response);
      });

      // Listen to new notifications
      socket.on('notification:new', (notification) => {
        if (!mounted) return;
        
        console.log('📬 New notification received:', notification);
        
        const isRead = notification.is_read === true || notification.isRead === true;
        
        // Add to notifications list
        setNotifications(prev => [
          {
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            payload: notification.payload || {},
            is_read: isRead,
            timestamp: notification.timestamp,
            created_at: notification.created_at || notification.timestamp || new Date().toISOString(),
          },
          ...prev,
        ]);

        // Increment unread count only if not read
        if (!isRead) {
          setUnreadCount(prev => {
            const newCount = prev + 1;
            console.log('📈 Unread count incremented to:', newCount);
            return newCount;
          });
        }

        // Show toast notification
        showSuccessToast(`${notification.title}`, {
          duration: 4000,
        });
      });

      // Listen to unread count updates
      socket.on('notifications:unread-count', (data) => {
        if (!mounted) return;
        console.log('📊 Unread count updated:', data.unreadCount);
        setUnreadCount(data.unreadCount);
      });

      return () => {
        socket.off('notification:new');
        socket.off('notifications:unread-count');
      };
    };

    if (isAuthenticated && user?.id) {
      initializeNotifications();
    }

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user?.id]);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async (options = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await notificationsService.getNotifications(options);
      setNotifications(response.data || []);
      
      // Fetch unread count
      const count = await notificationsService.getUnreadCount();
      setUnreadCount(count);
      
      return response;
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      console.log('🔄 Marking notification as read:', notificationId);
      await notificationsService.markAsRead(notificationId);
      
      // Update local state immediately
      setNotifications(prev => {
        const updated = prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        );
        console.log('✅ Local notifications updated:', updated);
        return updated;
      });
      
      // Decrement unread count immediately
      setUnreadCount(prev => {
        const newCount = Math.max(0, prev - 1);
        console.log('📉 Unread count updated from', prev, 'to', newCount);
        return newCount;
      });
      
      showSuccessToast('Notification marked as read');
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      showErrorToast('Failed to mark notification as read');
      // Refresh on error
      try {
        const count = await notificationsService.getUnreadCount();
        setUnreadCount(count);
      } catch (refreshErr) {
        console.warn('Failed to refresh unread count:', refreshErr);
      }
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      console.log('🔄 Marking all notifications as read');
      await notificationsService.markAllAsRead();
      
      // Update local state immediately
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      
      // Set unread count to 0 immediately
      console.log('✅ All notifications marked as read');
      setUnreadCount(0);
      
      showSuccessToast('All notifications marked as read');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      showErrorToast('Failed to mark all as read');
      // Refresh on error
      try {
        const count = await notificationsService.getUnreadCount();
        setUnreadCount(count);
      } catch (refreshErr) {
        console.warn('Failed to refresh unread count:', refreshErr);
      }
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationsService.deleteNotification(notificationId);
      
      // Update local state
      const deleted = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Decrement unread count if the deleted notification was unread
      if (deleted && !deleted.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      console.log('✅ Notification deleted:', notificationId);
      showSuccessToast('Notification deleted');
    } catch (err) {
      console.error('Failed to delete notification:', err);
      showErrorToast('Failed to delete notification');
      // Refresh on error
      try {
        const count = await notificationsService.getUnreadCount();
        setUnreadCount(count);
      } catch (refreshErr) {
        console.warn('Failed to refresh unread count:', refreshErr);
      }
    }
  }, [notifications]);

  // Delete all notifications
  const deleteAllNotifications = useCallback(async () => {
    try {
      await notificationsService.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      
      console.log('✅ All notifications deleted');
      showSuccessToast('All notifications cleared');
    } catch (err) {
      console.error('Failed to delete all notifications:', err);
      showErrorToast('Failed to clear notifications');
      // Refresh on error
      try {
        const count = await notificationsService.getUnreadCount();
        setUnreadCount(count);
      } catch (refreshErr) {
        console.warn('Failed to refresh unread count:', refreshErr);
      }
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  };
};


export default useNotifications;
