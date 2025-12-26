/* eslint-disable react-refresh/only-export-components */
// Lightweight state management using React Context + useReducer
import { 
  createContext, 
  useContext, 
  useReducer, 
  useEffect, 
  type ReactNode,
  type Dispatch,
} from 'react';
import { nanoid } from 'nanoid';
import { type Habit, type Badge } from './types';
import { 
  loadState, 
  saveState,
} from './habitStore';
import { checkBadgeUnlocks, createBadge } from '../utils/badgeUtils';

// ==================== State Shape ====================

/**
 * Optimized state structure for UI access
 * - logs organized as Record<habitId, Record<dateKey, boolean>> for O(1) lookup
 * - habits as array for easy iteration
 * - unlockedBadges as array sorted by unlock time
 */
export interface HabitsState {
  habits: Habit[];
  logs: Record<string, Record<string, boolean>>; // { habitId: { dateKey: completed } }
  theme: 'light' | 'dark';
  unlockedBadges: Badge[];
  isLoading: boolean;
}

// ==================== Actions ====================

type HabitsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_STATE'; payload: HabitsState }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'EDIT_HABIT'; payload: { id: string; updates: Partial<Habit> } }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'TOGGLE_HABIT_DATE'; payload: { habitId: string; date: string } }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'UNLOCK_BADGES'; payload: Badge[] };

// ==================== Reducer ====================

const habitsReducer = (state: HabitsState, action: HabitsAction): HabitsState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'LOAD_STATE':
      return { ...action.payload, isLoading: false };

    case 'ADD_HABIT':
      return {
        ...state,
        habits: [...state.habits, action.payload],
        logs: {
          ...state.logs,
          [action.payload.id]: {},
        },
      };

    case 'EDIT_HABIT': {
      return {
        ...state,
        habits: state.habits.map((habit) =>
          habit.id === action.payload.id
            ? { ...habit, ...action.payload.updates }
            : habit
        ),
      };
    }

    case 'DELETE_HABIT': {
      // Remove habit's logs using destructuring
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [action.payload]: _removed, ...remainingLogs } = state.logs;
      return {
        ...state,
        habits: state.habits.filter((h) => h.id !== action.payload),
        logs: remainingLogs,
      };
    }

    case 'TOGGLE_HABIT_DATE': {
      const { habitId, date } = action.payload;
      const habitLogs = state.logs[habitId] || {};
      const newCompleted = !habitLogs[date];

      return {
        ...state,
        logs: {
          ...state.logs,
          [habitId]: {
            ...habitLogs,
            [date]: newCompleted,
          },
        },
      };
    }

    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'UNLOCK_BADGES':
      return {
        ...state,
        unlockedBadges: [...state.unlockedBadges, ...action.payload],
      };

    default:
      return state;
  }
};

// ==================== Context ====================

interface HabitsContextValue {
  state: HabitsState;
  dispatch: Dispatch<HabitsAction>;
  actions: {
    addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
    editHabit: (id: string, updates: Partial<Habit>) => void;
    deleteHabit: (id: string) => void;
    toggleHabitDate: (habitId: string, date: string) => void;
    checkInHabit: (habitId: string, date: string) => void;
    setTheme: (theme: 'light' | 'dark') => void;
  };
  helpers: {
    isHabitCompletedOnDate: (habitId: string, date: string) => boolean;
    getHabitCompletedDates: (habitId: string) => string[];
    getAllLogs: () => Array<{ habitId: string; date: string; completed: boolean }>;
  };
}

const HabitsContext = createContext<HabitsContextValue | undefined>(undefined);

// ==================== Provider ====================

interface HabitsProviderProps {
  children: ReactNode;
}

export const HabitsProvider = ({ children }: HabitsProviderProps) => {
  // Initialize with empty state (loading will happen in useEffect)
  const initialState: HabitsState = {
    habits: [],
    logs: {},
    theme: 'light',
    unlockedBadges: [],
    isLoading: true,
  };

  const [state, dispatch] = useReducer(habitsReducer, initialState);

  // Load initial state from localStorage on mount
  useEffect(() => {
    const loadInitialState = () => {
      try {
        const appState = loadState();
        
        // Transform logs array to Record structure for O(1) lookup
        const logsRecord: Record<string, Record<string, boolean>> = {};
        appState.logs.forEach((log) => {
          if (!logsRecord[log.habitId]) {
            logsRecord[log.habitId] = {};
          }
          logsRecord[log.habitId][log.date] = log.completed;
        });

        const initialState: HabitsState = {
          habits: appState.habits,
          logs: logsRecord,
          theme: appState.settings.theme,
          unlockedBadges: appState.badges,
          isLoading: false,
        };

        dispatch({ type: 'LOAD_STATE', payload: initialState });
      } catch (err) {
        console.error('Failed to load initial state:', err);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadInitialState();
  }, []);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    if (state.isLoading) return; // Don't persist during initial load

    try {
      // Transform logs Record back to array for storage
      const logsArray = Object.entries(state.logs).flatMap(([habitId, dates]) =>
        Object.entries(dates).map(([date, completed]) => ({
          habitId,
          date,
          completed,
          timestamp: new Date().toISOString(),
        }))
      );

      const appState = loadState(); // Get current full state
      appState.habits = state.habits;
      appState.logs = logsArray;
      appState.settings.theme = state.theme;
      appState.badges = state.unlockedBadges;

      saveState(appState);
    } catch (err) {
      console.error('Failed to persist state:', err);
    }
  }, [state.habits, state.logs, state.theme, state.unlockedBadges, state.isLoading]);

  // Check for badge unlocks whenever habits or logs change
  useEffect(() => {
    if (state.isLoading) return;

    try {
      const logsArray = Object.entries(state.logs).flatMap(([habitId, dates]) =>
        Object.entries(dates)
          .filter(([, completed]) => completed)
          .map(([date]) => ({
            habitId,
            date,
            completed: true,
          }))
      );

      const newBadgeTypes = checkBadgeUnlocks(
        state.habits,
        logsArray,
        state.unlockedBadges
      );

      if (newBadgeTypes.length > 0) {
        const newBadges = newBadgeTypes.map((type) => createBadge(type));
        dispatch({ type: 'UNLOCK_BADGES', payload: newBadges });
      }
    } catch (err) {
      console.error('Failed to check badge unlocks:', err);
    }
  }, [state.habits, state.logs, state.unlockedBadges, state.isLoading]);

  // Action creators
  const actions = {
    addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => {
      const newHabit: Habit = {
        ...habit,
        id: nanoid(),
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_HABIT', payload: newHabit });
    },

    editHabit: (id: string, updates: Partial<Habit>) => {
      dispatch({ type: 'EDIT_HABIT', payload: { id, updates } });
    },

    deleteHabit: (id: string) => {
      dispatch({ type: 'DELETE_HABIT', payload: id });
    },

    toggleHabitDate: (habitId: string, date: string) => {
      dispatch({ type: 'TOGGLE_HABIT_DATE', payload: { habitId, date } });
    },

    checkInHabit: (habitId: string, date: string) => {
      // Alias for toggleHabitDate - more semantic for marking complete
      dispatch({ type: 'TOGGLE_HABIT_DATE', payload: { habitId, date } });
    },

    setTheme: (theme: 'light' | 'dark') => {
      dispatch({ type: 'SET_THEME', payload: theme });
    },
  };

  // Helper functions for common queries
  const helpers = {
    isHabitCompletedOnDate: (habitId: string, date: string): boolean => {
      return state.logs[habitId]?.[date] ?? false;
    },

    getHabitCompletedDates: (habitId: string): string[] => {
      const habitLogs = state.logs[habitId] || {};
      return Object.entries(habitLogs)
        .filter(([, completed]) => completed)
        .map(([date]) => date)
        .sort();
    },

    getAllLogs: () => {
      return Object.entries(state.logs).flatMap(([habitId, dates]) =>
        Object.entries(dates).map(([date, completed]) => ({
          habitId,
          date,
          completed,
        }))
      );
    },
  };

  const contextValue: HabitsContextValue = {
    state,
    dispatch,
    actions,
    helpers,
  };

  return (
    <HabitsContext.Provider value={contextValue}>
      {children}
    </HabitsContext.Provider>
  );
};

// ==================== Hook ====================

/**
 * Hook to access habits store
 * 
 * @example
 * ```tsx
 * const { state, actions, helpers } = useHabitsStore();
 * 
 * // Access state
 * const { habits, theme, unlockedBadges } = state;
 * 
 * // Use actions
 * actions.addHabit({ name: 'Exercise', color: 'blue' });
 * actions.toggleHabitDate('habit-id', '2024-12-26');
 * actions.setTheme('dark');
 * 
 * // Use helpers
 * const isCompleted = helpers.isHabitCompletedOnDate('habit-id', '2024-12-26');
 * const dates = helpers.getHabitCompletedDates('habit-id');
 * ```
 */
export const useHabitsStore = (): HabitsContextValue => {
  const context = useContext(HabitsContext);
  if (context === undefined) {
    throw new Error('useHabitsStore must be used within a HabitsProvider');
  }
  return context;
};

// ==================== Selectors (Optional) ====================

/**
 * Custom hook to select specific data from state
 * Useful for optimizing re-renders
 */
export const useHabits = () => {
  const { state } = useHabitsStore();
  return state.habits.filter((h) => !h.archived);
};

export const useTheme = () => {
  const { state, actions } = useHabitsStore();
  return { theme: state.theme, setTheme: actions.setTheme };
};

export const useBadges = () => {
  const { state } = useHabitsStore();
  return state.unlockedBadges;
};

export const useHabit = (habitId: string) => {
  const { state } = useHabitsStore();
  return state.habits.find((h) => h.id === habitId);
};
