import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiMenu,
  FiX,
  FiHome,
  FiUsers,
  FiUser,
  FiShoppingCart,
  FiBarChart2,
  FiStar,
  FiDollarSign,
  FiClipboard,
  FiLogOut,
  FiChevronDown,
  FiPackage,
  FiTag,
  FiSettings,
  FiGift,
  FiMail,
} from 'react-icons/fi';
import { useAdmin } from '../context/AdminContext';
import { useAuth } from '../../../hooks/useAuth';

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, logOut } = useAdmin();
  const { user } = useAuth();
  const location = useLocation();
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location, setSidebarOpen]);

  const menuItems = [
    { 
      id: 'home', 
      label: 'Go to Website', 
      icon: FiHome, 
      path: '/',
      exact: false,
      external: true
    },
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: FiHome, 
      path: '/admin',
      exact: true 
    },
    { 
      id: 'profile', 
      label: 'My Profile', 
      icon: FiUser, 
      path: '/admin/profile' 
    },
    { 
      id: 'users', 
      label: 'Users', 
      icon: FiUsers, 
      path: '/admin/users' 
    },
    { 
      id: 'bookings', 
      label: 'Bookings', 
      icon: FiShoppingCart, 
      path: '/admin/bookings' 
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: FiBarChart2, 
      path: '/admin/reports' 
    },
    { 
      id: 'reviews', 
      label: 'Reviews', 
      icon: FiStar, 
      path: '/admin/reviews' 
    },
    { 
      id: 'refunds', 
      label: 'Refunds', 
      icon: FiDollarSign, 
      path: '/admin/refunds' 
    },
    { 
      id: 'contact', 
      label: 'Contact Messages', 
      icon: FiMail, 
      path: '/admin/contact' 
    },
    { 
      id: 'logs', 
      label: 'Audit Logs', 
      icon: FiClipboard, 
      path: '/admin/logs' 
    },
    { 
      id: 'tours', 
      label: 'Tours', 
      icon: FiPackage, 
      submenu: [
        {
          id: 'packages',
          label: 'Packages',
          icon: FiPackage,
          path: '/admin/packages'
        },
        {
          id: 'addons',
          label: 'Add-ons',
          icon: FiGift,
          path: '/admin/addons'
        }
      ]
    },
    { 
      id: 'categories', 
      label: 'Categories', 
      icon: FiTag, 
      path: '/admin/categories' 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: FiSettings, 
      path: '/admin/settings' 
    },
  ];

  const isActive = (path, exact) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 lg:hidden z-50 p-2.5 bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow hover:scale-110"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white shadow-2xl transition-all duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:relative overflow-y-auto overscroll-contain flex flex-col`}
      >
        {/* Logo Section */}
        <div className="sticky top-0 p-6 border-b border-slate-700 bg-slate-900/80 backdrop-blur-md">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 via-teal-500 to-orange-500 bg-clip-text text-transparent flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-orange-600 flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            Admin
          </h1>
          <p className="text-xs text-slate-400 mt-1">Control Panel</p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 pb-32 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const submenuOpen = activeSubmenu === item.id;
            const submenuActive = hasSubmenu && item.submenu.some(sub => isActive(sub.path));

            if (hasSubmenu) {
              return (
                <div key={item.id}>
                  <button
                    onClick={() => setActiveSubmenu(submenuOpen ? null : item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                      submenuActive
                        ? 'bg-gradient-to-r from-teal-600 to-orange-600 shadow-lg shadow-teal-600/20'
                        : 'hover:bg-slate-700/50 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Icon
                      size={20}
                      className={`transition-transform ${submenuActive ? 'scale-110' : 'group-hover:scale-110'}`}
                    />
                    <span className="font-medium text-sm">{item.label}</span>
                    <FiChevronDown
                      size={16}
                      className={`ml-auto transition-transform ${submenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  
                  {/* Submenu */}
                  {submenuOpen && (
                    <div className="mt-1 ml-4 space-y-1 border-l-2 border-slate-700 pl-3">
                      {item.submenu.map((subitem) => {
                        const SubIcon = subitem.icon;
                        const subActive = isActive(subitem.path);
                        
                        return (
                          <Link
                            key={subitem.id}
                            to={subitem.path}
                            onClick={() => {
                              if (window.innerWidth < 1024) setSidebarOpen(false);
                            }}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 group ${
                              subActive
                                ? 'bg-teal-600/30 text-white'
                                : 'hover:bg-slate-700/50 text-slate-400 hover:text-white'
                            }`}
                          >
                            <SubIcon
                              size={16}
                              className={`transition-transform ${subActive ? 'scale-110' : 'group-hover:scale-110'}`}
                            />
                            <span className="font-medium text-sm">{subitem.label}</span>
                            {subActive && (
                              <div className="ml-auto w-1 h-1 rounded-full bg-white animate-pulse"></div>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => {
                  setActiveSubmenu(null);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  item.id === 'home'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg shadow-green-600/20 hover:from-green-700 hover:to-emerald-700 text-white font-semibold'
                    : active
                    ? 'bg-gradient-to-r from-teal-600 to-orange-600 shadow-lg shadow-teal-600/20'
                    : 'hover:bg-slate-700/50 text-slate-300 hover:text-white'
                }`}
              >
                <Icon
                  size={20}
                  className={`transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`}
                />
                <span className="font-medium text-sm">{item.label}</span>
                {active && (
                  <div className="ml-auto w-1 h-1 rounded-full bg-white animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="sticky bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-gradient-to-t from-slate-900 to-transparent space-y-3">
          {/* User Card */}
          <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
            <p className="text-xs text-slate-400">Logged in as</p>
            <p className="text-sm font-bold text-white truncate">{user?.name || 'Admin'}</p>
            <p className="text-xs text-teal-400">{user?.email || 'admin@example.com'}</p>
          </div>

          {/* Logout Button */}
          <button
            onClick={logOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-200 text-white font-medium text-sm shadow-lg hover:shadow-xl"
          >
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}

export default Sidebar;
