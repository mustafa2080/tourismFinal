import Header from './Header';
import Sidebar from './Sidebar';

/**
 * DashboardLayout Component
 * Layout wrapper for user dashboard pages
 */
const DashboardLayout = ({ children, isAdmin = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <Header />
      <div className="flex flex-1">
        <Sidebar isAdmin={isAdmin} />
        <main className="flex-1 overflow-y-auto">
          <div className="lg:max-w-6xl xl:max-w-7xl lg:mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;