import React, { useState } from 'react';
import Sidebar from './Sidebar';
import '../styles/layout/AdminLayout.css';

/**
 * Admin Layout Component
 * Layout for admin panel with navigation and content
 */
const AdminLayout = ({
  children,
  onLogout,
  adminName = 'Admin',
  className = '',
  ...props
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const adminMenuItems = [
    { icon: '📊', label: 'Dashboard', id: 'dashboard' },
    { icon: '📦', label: 'Packages', id: 'packages' },
    { icon: '📚', label: 'Bookings', id: 'bookings', badge: '12' },
    { icon: '👥', label: 'Customers', id: 'customers' },
    { type: 'divider' },
    { icon: '📰', label: 'Blog Posts', id: 'blog' },
    { icon: '🔔', label: 'Notifications', id: 'notifications', badge: '5' },
    { icon: '📊', label: 'Reports', id: 'reports' },
    { type: 'divider' },
    { icon: '⚙️', label: 'Settings', id: 'settings' },
    { icon: '🚪', label: 'Logout', id: 'logout' }
  ];

  const handleMenuItemClick = (item, index) => {
    if (item.id === 'logout') {
      onLogout?.();
    }
  };

  const classes = [className].filter(Boolean).join(' ');

  return (
    <div className={`admin-layout ${classes}`} {...props}>
      {/* Sidebar Navigation */}
      <Sidebar
        items={adminMenuItems}
        onItemClick={handleMenuItemClick}
        collapsed={sidebarCollapsed}
        onCollapseToggle={setSidebarCollapsed}
        title="Admin"
      />

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Bar */}
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-sidebar-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            <h1 className="admin-topbar-title">Admin Panel</h1>
          </div>

          <div className="admin-topbar-right">
            {/* Stats */}
            <div className="admin-stats">
              <div className="admin-stat-item">
                <span className="admin-stat-icon">📈</span>
                <span className="admin-stat-label">Sales</span>
              </div>
              <div className="admin-stat-item">
                <span className="admin-stat-icon">👥</span>
                <span className="admin-stat-label">Users</span>
              </div>
            </div>

            {/* Admin Info */}
            <div className="admin-user-info">
              <span className="admin-user-name">{adminName}</span>
              <span className="admin-user-avatar">👨‍💼</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

/**
 * Usage Example:
 * 
 * function AdminPanel() {
 *   return (
 *     <AdminLayout
 *       adminName="John Doe"
 *       onLogout={() => navigate('/login')}
 *     >
 *       <DashboardMetrics />
 *     </AdminLayout>
 *   );
 * }
 */
