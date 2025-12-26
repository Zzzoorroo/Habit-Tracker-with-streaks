// Layout component - Main app layout with navbar, sidebar, and content area
import { type FC, type ReactNode, useState, useEffect } from 'react';
import { useTheme } from '../store/useHabitsStore';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileMenu from './MobileMenu';

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme } = useTheme();

  // Apply dark mode class to html element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navbar */}
      <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />

      {/* Main container with sidebar and content */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Mobile Menu */}
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="text-gray-900 dark:text-gray-100">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
