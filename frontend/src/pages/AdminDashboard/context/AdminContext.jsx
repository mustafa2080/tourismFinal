import { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { useAuth } from '../../../hooks/useAuth';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const { logout } = useAuth();
  
  // Sidebar will be open on desktop and closed on mobile automatically
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const logOut = useCallback(() => {
    console.log('👋 [AdminContext] Logging out admin user');
    // Clear cookies and localStorage
    Cookies.remove('authToken');
    Cookies.remove('refreshToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Call auth logout which handles redirect
    logout();
  }, [logout]);

  const showNotification = useCallback((message, type = 'success') => {
    if (type === 'success') {
      toast.success(message);
    } else if (type === 'error') {
      toast.error(message);
    } else if (type === 'loading') {
      return toast.loading(message);
    }
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <AdminContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        activeTab,
        setActiveTab,
        logOut,
        showNotification,
        refreshTrigger,
        triggerRefresh,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}
