import Header from './Header';
import Footer from './Footer';

/**
 * MainLayout Component
 * Main layout wrapper for public pages
 */
const MainLayout = ({ children }) => {
  return (
    <div className="w-full flex flex-col bg-white dark:bg-slate-950 pointer-events-auto min-h-screen overflow-visible">
      <Header />
      <main className="w-full flex-1 pointer-events-auto overflow-visible">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
