import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import {
  FiMenu,
  FiX,
  FiHome,
  FiShoppingBag,
  FiBookmark,
  FiUser,
  FiMessageSquare,
  FiStar,
  FiLogOut,
  FiChevronRight,
  FiSettings,
} from 'react-icons/fi';

/**
 * Sidebar Component
 * Navigation sidebar for dashboard and admin pages
 */
const Sidebar = ({ isAdmin = false }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const dashboardMenus = [
    {
      label: 'نظرة عامة',
      path: '/dashboard',
      icon: FiHome,
      exact: true,
    },
    {
      label: 'حجوزاتي',
      path: '/dashboard/bookings',
      icon: FiShoppingBag,
    },
    {
      label: 'رغباتي',
      path: '/dashboard/wishlist',
      icon: FiBookmark,
    },
    {
      label: 'البيانات الشخصية',
      path: '/dashboard/profile',
      icon: FiUser,
    },
    {
      label: 'تقييماتي',
      path: '/dashboard/reviews',
      icon: FiStar,
    },
    {
      label: 'الرسائل',
      path: '/dashboard/messages',
      icon: FiMessageSquare,
    },
    {
      label: 'الإعدادات',
      path: '/dashboard/settings',
      icon: FiSettings,
    },
  ];

  const adminMenus = [
    {
      label: 'لوحة التحكم',
      path: '/admin',
      icon: FiHome,
      exact: true,
    },
    {
      label: 'الرحلات',
      path: '/admin/packages',
      icon: FiShoppingBag,
      submenu: [
        { label: 'كل الرحلات', path: '/admin/packages' },
        { label: 'إضافة رحلة جديدة', path: '/admin/packages/new' },
        { label: 'الفئات', path: '/admin/packages/categories' },
      ],
    },
    {
      label: 'الحجوزات',
      path: '/admin/bookings',
      icon: FiShoppingBag,
    },
    {
      label: 'العملاء',
      path: '/admin/customers',
      icon: FiUser,
    },
    {
      label: 'المدونة',
      path: '/admin/blog',
      icon: FiMessageSquare,
      submenu: [
        { label: 'المقالات', path: '/admin/blog' },
        { label: 'مقالة جديدة', path: '/admin/blog/new' },
        { label: 'الفئات', path: '/admin/blog/categories' },
      ],
    },
    {
      label: 'الإشعارات',
      path: '/admin/notifications',
      icon: FiMessageSquare,
    },
    {
      label: 'التقارير',
      path: '/admin/reports',
      icon: FiMessageSquare,
    },
    {
      label: 'الإعدادات',
      path: '/admin/settings',
      icon: FiSettings,
    },
  ];

  const menus = isAdmin ? adminMenus : dashboardMenus;

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleMenuClick = (item) => {
    if (item.submenu) {
      setExpandedMenu(expandedMenu === item.path ? null : item.path);
    } else {
      navigate(item.path);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 lg:hidden p-3 rounded-full bg-gradient-to-br from-teal-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-all"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static left-0 top-16 lg:top-0 z-40 w-64 h-[calc(100vh-4rem)] lg:h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-transform duration-300 lg:translate-x-0 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 space-y-2">
          {menus.map((item) => (
            <div key={item.path}>
              {/* Main Menu Item */}
              <button
                onClick={() => handleMenuClick(item)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive(item.path, item.exact)
                    ? 'bg-gradient-to-r from-teal-500/10 to-orange-600/10 text-teal-600 dark:text-teal-400 border-l-2 border-teal-600'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </div>
                {item.submenu && (
                  <FiChevronRight
                    size={18}
                    className={`transition-transform ${
                      expandedMenu === item.path ? 'rotate-90' : ''
                    }`}
                  />
                )}
              </button>

              {/* Submenu Items */}
              {item.submenu && expandedMenu === item.path && (
                <div className="mt-2 ml-4 space-y-1 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                  {item.submenu.map((subitem) => (
                    <button
                      key={subitem.path}
                      onClick={() => navigate(subitem.path)}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive(subitem.path)
                          ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current" />
                      {subitem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 font-medium transition-colors"
          >
            <FiLogOut size={18} />
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;