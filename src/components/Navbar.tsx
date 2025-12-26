// Top Navbar component with app name and theme switcher
import { type FC } from 'react';
import { Link } from 'react-router-dom';
import ThemeSelector from './ThemeSelector';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: FC<NavbarProps> = ({ onMenuClick }) => {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Menu button (mobile) + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Open menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Habit Tracker
              </span>
            </Link>
          </div>

          {/* Right: Theme selector */}
          <ThemeSelector />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
