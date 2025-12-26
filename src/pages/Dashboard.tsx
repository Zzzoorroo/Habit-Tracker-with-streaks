// Main Dashboard page
import { type FC } from 'react';
import { useHabitsStore } from '../store/useHabitsStore';
import { getTodayKey, formatShortDate, calculateStreak } from '../utils/dateUtils';
import BadgeGallery from '../components/BadgeGallery';
import { useBadgeNotifications } from '../hooks/useBadgeNotifications';

const Dashboard: FC = () => {
  const { state, actions, helpers } = useHabitsStore();
  const todayKey = getTodayKey();
  const todayDate = new Date();

  // Show toast notifications when badges are unlocked
  useBadgeNotifications(state.unlockedBadges);

  // Filter non-archived habits
  const activeHabits = state.habits.filter((h) => !h.archived);

  // Calculate daily completion percentage
  const totalHabits = activeHabits.length;
  const completedToday = activeHabits.filter((habit) =>
    helpers.isHabitCompletedOnDate(habit.id, todayKey)
  ).length;
  const completionPercentage = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  // Handle check-in toggle
  const handleToggleCheckIn = (habitId: string) => {
    actions.toggleHabitDate(habitId, todayKey);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with date */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {formatShortDate(todayDate)}
        </p>
      </div>

      {/* Daily completion summary */}
      <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Daily Progress
          </h2>
          <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {completedToday} of {totalHabits} habits completed today
        </p>
      </div>

      {/* Habits list */}
      {activeHabits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No habits yet. Create your first habit to get started!
          </p>
          <a
            href="/habits"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Add Your First Habit
          </a>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {activeHabits.map((habit) => {
              const completedDates = helpers.getHabitCompletedDates(habit.id);
              const currentStreak = calculateStreak(completedDates);
              const isCompletedToday = helpers.isHabitCompletedOnDate(habit.id, todayKey);

              return (
                <div
                  key={habit.id}
                  className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  {/* Habit name with color indicator */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`w-4 h-4 rounded border-2 border-${habit.color}-500 flex-shrink-0`}
                        style={{ backgroundColor: `var(--color-${habit.color}-500, #3b82f6)` }}
                        aria-label={`${habit.color} color indicator`}
                      />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {habit.name}
                      </h3>
                    </div>
                  </div>

                  {/* Streak display */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🔥</span>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {currentStreak}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">day streak</p>
                      </div>
                    </div>
                  </div>

                  {/* Check-in button */}
                  <button
                    onClick={() => handleToggleCheckIn(habit.id)}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                      isCompletedToday
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100'
                    }`}
                    aria-label={isCompletedToday ? 'Mark as incomplete' : 'Check in for today'}
                  >
                    {isCompletedToday ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Completed Today
                      </span>
                    ) : (
                      'Check In'
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Badges Section */}
          <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <BadgeGallery unlockedBadges={state.unlockedBadges} />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
