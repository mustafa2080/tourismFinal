import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useNotifications from '../hooks/useNotifications';
import '../styles/NotificationCenter.css';

/**
 * Notification Center Component
 * Shows notifications list and handles interactions
 */
const NotificationCenter = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, read

  // Filter notifications based on read status
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    const icons = {
      'booking:created': '✅',
      'booking:confirmed': '🎉',
      'booking:cancelled': '❌',
      'booking:reminder': '⏰',
      'review:approved': '⭐',
      'payment:received': '💳',
      'contact:received': '📧',
      'general': '📢',
      'admin:alert': '🚨',
    };
    return icons[type] || '📬';
  };

  // Get navigation URL based on notification type and payload
  const getNavigationUrl = (notification) => {
    if (!notification) return null;

    const { type, payload } = notification;

    // Handle booking-related notifications
    if (type === 'booking:created' || type === 'booking:confirmed' || type === 'booking:reminder') {
      if (payload?.relatedId) {
        return `/bookings/${payload.relatedId}`;
      }
      if (payload?.bookingNumber) {
        return `/bookings?search=${payload.bookingNumber}`;
      }
    }

    // Handle review notifications
    if (type === 'review:approved') {
      if (payload?.packageTitle) {
        return `/packages?search=${payload.packageTitle}`;
      }
    }

    // Handle payment notifications
    if (type === 'payment:received') {
      return `/bookings`;
    }

    // Handle contact notifications
    if (type === 'contact:received') {
      return `/admin/messages`;
    }

    return null;
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read first
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Get navigation URL
    const url = getNavigationUrl(notification);
    
    if (url) {
      // Close the notification panel
      setIsOpen(false);
      // Navigate to the related page
      navigate(url);
    }
  };

  // Format time difference
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="notification-center">
      {/* Notification Bell Icon with Badge */}
      <div className="notification-bell">
        <button
          className="bell-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Notifications"
        >
          🔔
          {unreadCount > 0 && (
            <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>

        {/* Notification Dropdown Panel */}
        {isOpen && (
          <div className="notification-panel">
            {/* Header */}
            <div className="notification-header">
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <button
                  className="mark-all-read-btn"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                >
                  ✓ Mark all read
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="notification-filter">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                Unread ({unreadCount})
              </button>
              <button
                className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
                onClick={() => setFilter('read')}
              >
                Read
              </button>
            </div>

            {/* Notifications List */}
            <div className="notification-list">
              {isLoading ? (
                <div className="loading">Loading notifications...</div>
              ) : filteredNotifications.length === 0 ? (
                <div className="empty-state">
                  <p>
                    {filter === 'unread'
                      ? 'No unread notifications'
                      : filter === 'read'
                      ? 'No read notifications'
                      : 'No notifications yet'}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
                    onClick={() => handleNotificationClick(notification)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNotificationClick(notification);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    style={{ cursor: getNavigationUrl(notification) ? 'pointer' : 'default' }}
                  >
                    {/* Notification Icon */}
                    <span className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </span>

                    {/* Notification Content */}
                    <div className="notification-content">
                      <p className="notification-title">{notification.title}</p>
                      <p className="notification-message">{notification.message}</p>
                      <span className="notification-time">
                        {getTimeAgo(notification.timestamp || notification.created_at)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="notification-actions" onClick={(e) => e.stopPropagation()}>
                      {!notification.is_read && (
                        <button
                          className="action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          title="Mark as read"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        className="action-btn delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {filteredNotifications.length > 0 && (
              <div className="notification-footer">
                <button
                  className="clear-all-btn"
                  onClick={deleteAllNotifications}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
