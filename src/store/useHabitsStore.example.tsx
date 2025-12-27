// Example usage of useHabitsStore
import { type FC } from 'react';
import { HabitsProvider, useHabitsStore, useHabits, useTheme } from './useHabitsStore';
import { toDateKey } from '../utils/dateUtils';
import { calculateStreak } from '../utils/dateUtils';

// ==================== Example 1: Basic Usage ====================

const HabitListExample: FC = () => {
  const { state, actions, helpers } = useHabitsStore();
  const today = toDateKey(new Date());

  const handleAddHabit = () => {
    actions.addHabit({
      name: 'Morning Exercise',
      description: 'Do 20 push-ups',
      color: 'blue',
      icon: '💪',
    });
  };

  const handleToggleHabit = (habitId: string) => {
    actions.toggleHabitDate(habitId, today);
  };

  const handleDeleteHabit = (habitId: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      actions.deleteHabit(habitId);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Habits</h1>
      
      <button 
        onClick={handleAddHabit}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Add Habit
      </button>

      {state.isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-2">
          {state.habits.map((habit) => {
            const isCompletedToday = helpers.isHabitCompletedOnDate(habit.id, today);
            const completedDates = helpers.getHabitCompletedDates(habit.id);
            const currentStreak = calculateStreak(completedDates);

            return (
              <div 
                key={habit.id} 
                className="p-4 border rounded shadow-sm flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold">
                    {habit.icon} {habit.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Streak: {currentStreak} days | Total: {completedDates.length} completions
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleHabit(habit.id)}
                    className={`px-3 py-1 rounded ${
                      isCompletedToday 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200'
                    }`}
                  >
                    {isCompletedToday ? '✓' : 'Complete'}
                  </button>
                  
                  <button
                    onClick={() => handleDeleteHabit(habit.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {state.unlockedBadges.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">Unlocked Badges</h2>
          <div className="flex gap-2">
            {state.unlockedBadges.map((badge) => (
              <div 
                key={badge.type}
                className="p-2 border rounded text-center"
                title={badge.description}
              >
                <div className="text-2xl">{badge.icon}</div>
                <div className="text-xs">{badge.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== Example 2: Using Selectors ====================

const ThemeToggleExample: FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button 
      onClick={toggleTheme}
      className="px-4 py-2 bg-gray-200 rounded"
    >
      {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
    </button>
  );
};

// ==================== Example 3: Using Custom Selector ====================

const ActiveHabitsExample: FC = () => {
  const habits = useHabits(); // Only returns non-archived habits

  return (
    <div>
      <h2>Active Habits ({habits.length})</h2>
      <ul>
        {habits.map((habit) => (
          <li key={habit.id}>{habit.name}</li>
        ))}
      </ul>
    </div>
  );
};

// ==================== Example 4: Editing a Habit ====================

const EditHabitExample: FC<{ habitId: string }> = ({ habitId }) => {
  const { actions } = useHabitsStore();

  const handleEdit = () => {
    actions.editHabit(habitId, {
      name: 'Updated Habit Name',
      description: 'New description',
      color: 'green',
    });
  };

  return (
    <button onClick={handleEdit}>
      Edit Habit
    </button>
  );
};

// ==================== Example 5: Monthly Calendar View ====================

const CalendarExample: FC<{ habitId: string }> = ({ habitId }) => {
  const { helpers, actions } = useHabitsStore();
  
  // Get last 30 days
  const last30Days: string[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    last30Days.push(toDateKey(date));
  }

  return (
    <div className="grid grid-cols-7 gap-1">
      {last30Days.map((date) => {
        const isCompleted = helpers.isHabitCompletedOnDate(habitId, date);
        return (
          <button
            key={date}
            onClick={() => actions.toggleHabitDate(habitId, date)}
            className={`p-2 border rounded ${
              isCompleted ? 'bg-green-200' : 'bg-gray-100'
            }`}
          >
            {date.split('-')[2]}
          </button>
        );
      })}
    </div>
  );
};

// ==================== Example 6: Main App Wrapper ====================

/**
 * Wrap your entire app with HabitsProvider
 */
const AppExample: FC = () => {
  return (
    <HabitsProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="p-4 bg-white shadow">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Habit Tracker</h1>
            <ThemeToggleExample />
          </div>
        </header>
        
        <main className="container mx-auto py-8">
          <HabitListExample />
          <ActiveHabitsExample />
        </main>
      </div>
    </HabitsProvider>
  );
};

// ==================== Example 7: Direct State Access ====================

const StatsExample: FC = () => {
  const { state, helpers } = useHabitsStore();
  
  const totalHabits = state.habits.length;
  const activeHabits = state.habits.filter(h => !h.archived).length;
  const totalCompletions = helpers.getAllLogs().filter(log => log.completed).length;
  const badgeCount = state.unlockedBadges.length;

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="p-4 bg-white rounded shadow">
        <div className="text-2xl font-bold">{totalHabits}</div>
        <div className="text-sm text-gray-600">Total Habits</div>
      </div>
      <div className="p-4 bg-white rounded shadow">
        <div className="text-2xl font-bold">{activeHabits}</div>
        <div className="text-sm text-gray-600">Active Habits</div>
      </div>
      <div className="p-4 bg-white rounded shadow">
        <div className="text-2xl font-bold">{totalCompletions}</div>
        <div className="text-sm text-gray-600">Total Completions</div>
      </div>
      <div className="p-4 bg-white rounded shadow">
        <div className="text-2xl font-bold">{badgeCount}</div>
        <div className="text-sm text-gray-600">Badges Earned</div>
      </div>
    </div>
  );
};

export {
  HabitListExample,
  ThemeToggleExample,
  ActiveHabitsExample,
  EditHabitExample,
  CalendarExample,
  AppExample,
  StatsExample,
};
