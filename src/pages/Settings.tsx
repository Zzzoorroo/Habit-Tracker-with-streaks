// Settings page - App settings and preferences
import { type FC, useState, useRef } from 'react';
import { useHabitsStore } from '../store/useHabitsStore';
import { exportDataAsJSON, importDataFromJSON } from '../utils/storage';
import { loadState, clearState, saveState } from '../store/habitStore';
import { createDefaultState } from '../store/types';

const Settings: FC = () => {
  const { state, actions } = useHabitsStore();
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      exportDataAsJSON(loadState());
      // Show success feedback briefly
      const button = document.getElementById('export-btn');
      if (button) {
        button.textContent = '✓ Downloaded';
        setTimeout(() => {
          button.textContent = 'Export Data';
        }, 2000);
      }
    } catch {
      alert('Failed to export data. Please try again.');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(false);

    const result = await importDataFromJSON(file);
    
    if (result.success && result.state) {
      // Save imported state
      saveState(result.state);
      // Reload the page to apply new state
      setImportSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      setImportError(result.error || 'Failed to import data');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    clearState();
    saveState(createDefaultState());
    setShowResetConfirm(false);
    // Reload page to reset state
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Settings</h1>
      
      {/* Theme Section */}
      <section className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Appearance</h2>
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Theme
          </label>
          <div className="flex gap-3">
            {(['light', 'dark', 'ocean'] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => actions.setTheme(theme)}
                className={`px-4 py-2 rounded-md capitalize transition-all ${
                  state.theme === theme
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {theme === 'light' && '☀️ '}
                {theme === 'dark' && '🌙 '}
                {theme === 'ocean' && '🌊 '}
                {theme}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Data Management Section */}
      <section className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Data Management</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Export your data for backup or import previously saved data.
        </p>
        
        <div className="space-y-4">
          {/* Export */}
          <div>
            <button
              id="export-btn"
              onClick={handleExport}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <span>📥</span>
              <span>Export Data</span>
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Download your habits, logs, and badges as a JSON file.
            </p>
          </div>

          {/* Import */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={handleImportClick}
              className="w-full sm:w-auto px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <span>📤</span>
              <span>Import Data</span>
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Upload a previously exported JSON file to restore your data.
            </p>
            
            {/* Import feedback */}
            {importError && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">
                  <span className="font-semibold">Error:</span> {importError}
                </p>
              </div>
            )}
            {importSuccess && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✓ Data imported successfully! Reloading...
                </p>
              </div>
            )}
          </div>

          {/* Reset */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <span>🗑️</span>
              <span>Reset All Data</span>
            </button>
            <p className="text-xs text-red-500 dark:text-red-400 mt-2">
              ⚠️ Warning: This will delete all your habits, logs, and badges permanently.
            </p>
          </div>
        </div>
      </section>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Confirm Reset
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to reset all data? This will permanently delete:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-1">
              <li>All habits</li>
              <li>All check-in logs</li>
              <li>All unlocked badges</li>
              <li>All settings</li>
            </ul>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-6">
              This action cannot be undone!
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelReset}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReset}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
