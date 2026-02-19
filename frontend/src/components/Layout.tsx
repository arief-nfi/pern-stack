import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './layout/Sidebar';
import { MobileNav } from './layout/MobileNav';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Listen for sidebar collapse state changes
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }

    // Listen for storage changes to sync collapse state
    const handleStorageChange = () => {
      const savedState = localStorage.getItem('sidebar-collapsed');
      if (savedState !== null) {
        setIsCollapsed(JSON.parse(savedState));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-window updates
    const handleCollapseChange = () => {
      const savedState = localStorage.getItem('sidebar-collapsed');
      if (savedState !== null) {
        setIsCollapsed(JSON.parse(savedState));
      }
    };
    
    window.addEventListener('sidebar-collapse-change', handleCollapseChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sidebar-collapse-change', handleCollapseChange);
    };
  }, []);

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  const closeMobileNav = () => {
    setIsMobileNavOpen(false);
  };

  return (
    <div className="dashboard-container">
      {/* Desktop Sidebar - Fixed */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav isOpen={isMobileNavOpen} onClose={closeMobileNav} />
      
      {/* Main Content - With margin to account for fixed sidebar */}
      <div
        className="flex flex-col min-h-screen transition-all duration-300"
        style={{
          marginLeft: window.innerWidth >= 768 ? (isCollapsed ? '4rem' : '18rem') : '0'
        }}
      >
        <Header onMobileNavToggle={toggleMobileNav} />
        <main className="flex-1 bg-slate-900">
          <div className="w-full py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;