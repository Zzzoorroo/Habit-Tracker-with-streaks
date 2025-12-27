// Statistics page - View habit statistics and progress with monthly heatmap
import { type FC, useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import HeatmapMonth from '../components/HeatmapMonth';
import { useHabitsStore } from '../store/useHabitsStore';
import { getCurrentMonthYear } from '../utils/dateUtils';

const Statistics: FC = () => {
  const { state } = useHabitsStore();
  const { habits, logs } = state;

  // Month navigation state
  const currentMonthYear = getCurrentMonthYear();
  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date(currentMonthYear.year, currentMonthYear.month, 1)
  );

  // Navigation handlers
  const handlePreviousMonth = () => {
    setSelectedDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date(currentMonthYear.year, currentMonthYear.month, 1));
  };

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const isCurrentMonth = year === currentMonthYear.year && month === currentMonthYear.month;

  // Filter active habits
  const activeHabits = habits.filter(h => !h.archived);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Statistics</h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Habits</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {activeHabits.length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Check-ins</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {Object.values(logs).reduce((total, habitLogs) => {
              return total + Object.values(habitLogs).filter(Boolean).length;
            }, 0)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {format(selectedDate, 'MMM yyyy')}
          </div>
        </div>
      </div>

      {/* Monthly Heatmap */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {/* Month Selector */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Monthly Activity
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousMonth}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              aria-label="Previous month"
            >
              ← Previous
            </button>
            <span className="px-4 text-sm font-medium text-gray-900 dark:text-white">
              {format(selectedDate, 'MMMM yyyy')}
            </span>
            <button
              onClick={handleNextMonth}
              disabled={isCurrentMonth}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                isCurrentMonth
                  ? 'text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              aria-label="Next month"
            >
              Next →
            </button>
            {!isCurrentMonth && (
              <button
                onClick={handleToday}
                className="ml-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
              >
                Today
              </button>
            )}
          </div>
        </div>

        {/* Heatmap */}
        {activeHabits.length > 0 ? (
          <HeatmapMonth
            year={year}
            month={month}
            logs={logs}
            habits={habits}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No habits to display. Create your first habit to start tracking!
            </p>
            <a
              href="/habits"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Go to Habits
            </a>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
        <p>
          <strong>Tip:</strong> Hover over any day to see which habits you completed.
          The color intensity shows how many habits you completed that day.
        </p>
      </div>
    </div>
  );
};

export default Statistics;
