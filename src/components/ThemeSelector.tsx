// ThemeSelector component - Dropdown to select between light, dark, and ocean themes
import { type FC, useState } from 'react';
import { useTheme } from '../store/useHabitsStore';

const themes = [
  { value: 'light', label: 'Light', icon: '☀️', description: 'Bright and clean' },
  { value: 'dark', label: 'Dark', icon: '🌙', description: 'Easy on the eyes' },
  { value: 'ocean', label: 'Ocean', icon: '🌊', description: 'Deep blue vibes' },
] as const;

const ThemeSelector: FC = () => {
  const { theme, setTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  const currentTheme = themes.find(t => t.value === theme) || themes[0];

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'ocean') => {
    setTheme(newTheme);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Change theme"
        aria-expanded={showMenu}
      >
        <span className="text-xl">{currentTheme.icon}</span>
        <span className="hidden sm:inline">{currentTheme.label}</span>
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
      {showMenu && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {themes.map((themeOption) => (
            <button
              key={themeOption.value}
              onClick={() => handleThemeChange(themeOption.value)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-start gap-3 transition-colors ${
                theme === themeOption.value ? 'bg-gray-50 dark:bg-gray-700' : ''
              } ${themeOption.value === 'ocean' ? 'rounded-b-md' : ''} ${themeOption.value === 'light' ? 'rounded-t-md' : ''}`}
            >
              <span className="text-2xl mt-0.5">{themeOption.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {themeOption.label}
                  </span>
                  {theme === themeOption.value && (
                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                  )}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {themeOption.description}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default ThemeSelector;
