import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { useAdmin } from './context/AdminContext';
import './styles/admin-dashboard.css';
import './styles/sidebar.css';
import './styles/header.css';
import './styles/layout.css';

export function AdminLayout({ children }) {
  const { sidebarOpen } = useAdmin();

  return (
    <div className="flex w-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <main className="flex-1 flex flex-col w-full overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content - Scrollable */}
        <div className="flex-1 w-full overflow-y-auto overflow-x-hidden">
          <div className="w-full pt-4 sm:pt-6 lg:pt-8 pb-8 px-3 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
