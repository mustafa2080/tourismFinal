import { io } from 'socket.io-client';

let socket = null;

export const socketService = {
  /**
   * Initialize Socket.IO connection
   * @param {string} url - Socket server URL
   * @param {Object} options - Socket options
   * @returns {Object} - Socket instance
   */
  init(url, options = {}) {
    // Don't re-initialize if already initialized
    if (socket && socket.connected) {
      console.log('⚠️ Socket already initialized and connected. Skipping re-initialization.');
      return socket;
    }

    // Clean up old socket if it exists
    if (socket) {
      try {
        socket.disconnect();
        socket = null;
      } catch (err) {
        console.warn('⚠️ Error cleaning up old socket:', err.message);
      }
    }

    const defaultOptions = {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      upgrade: false // Prevent WebSocket upgrade issues
    };

    try {
      socket = io(url, { ...defaultOptions, ...options });

      socket.on('connect', () => {
        console.log('✅ Socket.IO connected:', socket.id);
        return undefined;
      });

      socket.on('disconnect', () => {
        console.log('❌ Socket.IO disconnected');
        return undefined;
      });

      socket.on('error', (error) => {
        // Suppress extension errors
        if (error && error.toString && error.toString().includes('message channel closed')) {
          console.debug('⚠️ Suppressed extension error');
          return;
        }
        console.error('❌ Socket.IO error:', error);
        return undefined;
      });

      socket.on('connect_error', (error) => {
        // Suppress extension errors
        if (error && error.message && error.message.includes('message channel closed')) {
          console.debug('⚠️ Suppressed extension error');
          return;
        }
        console.warn('⚠️ Socket.IO connection error:', error?.message);
        return undefined;
      });

      // Suppress Chrome extension errors gracefully
      socket.on('exception', (error) => {
        if (error && error.toString && error.toString().includes('message channel closed')) {
          return;
        }
        console.warn('⚠️ Socket.IO exception:', error);
        return undefined;
      });

    } catch (err) {
      console.error('❌ Socket.IO initialization error:', err);
    }

    // Add global error handler for extension-related errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        if (event.message && event.message.includes('message channel closed')) {
          event.preventDefault();
          console.debug('⚠️ Suppressed extension error: message channel closed');
        }
      });

      // Handle unhandled promise rejections from extensions
      window.addEventListener('unhandledrejection', (event) => {
        if (event.reason && event.reason.message && event.reason.message.includes('message channel closed')) {
          event.preventDefault();
          console.debug('⚠️ Suppressed extension error');
        }
      });
    }

    return socket;
  },

  /**
   * Connect to default Socket.IO server
   *
   * IMPORTANT: The backend (backend/src/websocket/socket.ts) puts ALL
   * realtime events (notification:new, booking:confirmed, wishlist:updated,
   * etc.) on a dedicated Socket.IO namespace: `/notifications`. Connecting
   * to the bare origin only joins the default `/` namespace, which the
   * server never emits anything to - so every listener silently receives
   * nothing. Appending the namespace path here is what actually wires the
   * client up to where the events are sent.
   * @returns {Object} - Socket instance
   */
  connect() {
    const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    return this.init(`${url}/notifications`);
  },

  /**
   * Get socket instance
   * @returns {Object} - Socket instance
   */
  getSocket() {
    if (!socket) {
      console.debug('⚠️ Socket not initialized yet.');
    }
    return socket;
  },

  /**
   * Listen to booking created notification
   * @param {Function} callback - Callback function
   */
  onBookingCreated(callback) {
    if (!socket) return;
    socket.on('booking:created', (data) => {
      console.log('📬 Booking created:', data);
      try {
        callback(data);
      } catch (err) {
        console.error('Error in booking:created callback:', err);
      }
      return undefined; // Prevent message channel closed error
    });
  },

  /**
   * Listen to booking status change
   * @param {Function} callback - Callback function
   */
  onBookingStatusChanged(callback) {
    if (!socket) return;
    socket.on('booking:status_changed', (data) => {
      console.log('📬 Booking status changed:', data);
      try {
        callback(data);
      } catch (err) {
        console.error('Error in booking:status_changed callback:', err);
      }
      return undefined; // Prevent message channel closed error
    });
  },

  /**
   * Listen to booking confirmed
   * @param {Function} callback - Callback function
   */
  onBookingConfirmed(callback) {
    if (!socket) return;
    socket.on('booking:confirmed', (data) => {
      console.log('📬 Booking confirmed:', data);
      try {
        callback(data);
      } catch (err) {
        console.error('Error in booking:confirmed callback:', err);
      }
      return undefined; // Prevent message channel closed error
    });
  },

  /**
   * Listen to booking cancelled
   * @param {Function} callback - Callback function
   */
  onBookingCancelled(callback) {
    if (!socket) return;
    socket.on('booking:cancelled', (data) => {
      console.log('📬 Booking cancelled:', data);
      try {
        callback(data);
      } catch (err) {
        console.error('Error in booking:cancelled callback:', err);
      }
      return undefined; // Prevent message channel closed error
    });
  },

  /**
   * Listen to payment received
   * @param {Function} callback - Callback function
   */
  onPaymentReceived(callback) {
    if (!socket) return;
    socket.on('payment:received', (data) => {
      console.log('📬 Payment received:', data);
      try {
        callback(data);
      } catch (err) {
        console.error('Error in payment:received callback:', err);
      }
      return undefined; // Prevent message channel closed error
    });
  },

  /**
   * Listen to review added
   * @param {Function} callback - Callback function
   */
  onReviewAdded(callback) {
    if (!socket) return;
    socket.on('review:added', (data) => {
      console.log('📬 Review added:', data);
      try {
        callback(data);
      } catch (err) {
        console.error('Error in review:added callback:', err);
      }
      return undefined; // Prevent message channel closed error
    });
  },

  /**
   * Listen to new review submission
   * @param {Function} callback - Callback function
   */
  onNewReview(callback) {
    if (!socket) return;
    socket.on('new_review', (data) => {
      console.log('📬 New review submitted:', data);
      try {
        callback(data);
      } catch (err) {
        console.error('Error in new_review callback:', err);
      }
      return undefined; // Prevent message channel closed error
    });
  },

  /**
   * Listen to review approval
   * @param {Function} callback - Callback function
   */
  onReviewApproved(callback) {
    if (!socket) return;
    socket.on('review_approved', (data) => {
      console.log('✅ Review approved:', data);
      try {
        callback(data);
      } catch (err) {
        console.error('Error in review_approved callback:', err);
      }
      return undefined; // Prevent message channel closed error
    });
  },

  /**
   * Listen to review rejection
   * @param {Function} callback - Callback function
   */
  onReviewRejected(callback) {
    if (!socket) return;
    socket.on('review_rejected', (data) => {
      console.log('❌ Review rejected:', data);
      try {
        callback(data);
      } catch (err) {
        console.error('Error in review_rejected callback:', err);
      }
      return undefined; // Prevent message channel closed error
    });
  },

  /**
   * Listen to new notifications (from /notifications namespace)
   * @param {Function} callback - Callback function
   */
  onNewNotification(callback) {
    if (!socket) return;
    socket.on('notification:new', (data) => {
      console.log('🔔 New notification:', data);
      try {
        callback(data);
      } catch (err) {
        console.error('Error in notification:new callback:', err);
      }
      return undefined; // Prevent message channel closed error
    });
  },

  /**
   * Listen to general notification
   * @param {Function} callback - Callback function
   */
  onNotification(callback) {
    if (!socket) return;
    socket.on('notification', (data) => {
      console.log('📬 Notification:', data);
      try {
        callback(data);
      } catch (err) {
        console.error('Error in notification callback:', err);
      }
      return undefined; // Prevent message channel closed error
    });
  },

  /**
   * Listen to multiple notifications
   * @param {Object} handlers - { eventName: callback }
   */
  onNotifications(handlers) {
    if (!socket) return;
    
    Object.entries(handlers).forEach(([event, callback]) => {
      socket.on(event, (data) => {
        console.log(`📬 ${event}:`, data);
        try {
          callback(data);
        } catch (err) {
          console.error(`Error in ${event} callback:`, err);
        }
        return undefined; // Prevent message channel closed error
      });
    });
  },

  /**
   * Emit event to server
   * @param {string} event - Event name
   * @param {Object} data - Event data
   * @param {Function} callback - Acknowledgment callback (optional)
   */
  emit(event, data, callback = null) {
    if (!socket) {
      console.warn('⚠️ Socket not initialized');
      return;
    }
    
    if (callback && typeof callback === 'function') {
      // Wrap the callback to handle async responses safely
      const wrappedCallback = (...args) => {
        try {
          callback(...args);
        } catch (err) {
          console.error(`Error in emit callback for '${event}':`, err);
        }
      };
      socket.emit(event, data, wrappedCallback);
    } else {
      socket.emit(event, data);
    }
  },

  /**
   * Acknowledge notification as read
   * @param {string} notificationId - Notification ID
   */
  acknowledgeNotification(notificationId) {
    this.emit('notification:read', { notificationId });
  },

  /**
   * Leave a room
   * @param {string} room - Room name
   */
  leaveRoom(room) {
    if (!socket) return;
    socket.emit('leave_room', { room });
  },

  /**
   * Join a room (for targeted notifications)
   * @param {string} room - Room name
   */
  joinRoom(room) {
    if (!socket) return;
    socket.emit('join_room', { room });
  },

  /**
   * Disconnect socket
   */
  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
      console.log('🔌 Socket.IO disconnected');
    }
  },

  /**
   * Reconnect socket
   */
  reconnect() {
    if (socket) {
      socket.connect();
      console.log('🔌 Socket.IO reconnecting...');
    }
  },

  /**
   * Remove event listener
   * @param {string} event - Event name
   */
  off(event) {
    if (socket) {
      socket.off(event);
    }
  },

  /**
   * Remove all event listeners
   */
  offAll() {
    if (socket) {
      socket.offAny();
    }
  },

  /**
   * Check if socket is connected
   * @returns {boolean}
   */
  isConnected() {
    return socket && socket.connected;
  },

  /**
   * Get socket ID
   * @returns {string}
   */
  getId() {
    return socket ? socket.id : null;
  }
};
