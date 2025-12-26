// Top Navbar component with app name and theme switcher
import { type FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../store/useHabitsStore';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: FC<NavbarProps> = ({ onMenuClick }) => {
  const { theme, setTheme } = useTheme();
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    setShowThemeMenu(false);
  };

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

          {/* Right: Theme switcher dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Change theme"
            >
              <span>{theme === 'light' ? '☀️' : '🌙'}</span>
              <span className="hidden sm:inline">Theme</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown menu */}
            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
                    theme === 'light' ? 'bg-gray-50 dark:bg-gray-700' : ''
                  }`}
                >
                  <span>☀️</span>
                  <span>Light</span>
                  {theme === 'light' && <span className="ml-auto">✓</span>}
                </button>
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 rounded-b-md ${
                    theme === 'dark' ? 'bg-gray-50 dark:bg-gray-700' : ''
                  }`}
                >
                  <span>🌙</span>
                  <span>Dark</span>
                  {theme === 'dark' && <span className="ml-auto">✓</span>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showThemeMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowThemeMenu(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
