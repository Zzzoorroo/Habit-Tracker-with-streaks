// Storage management with versioning and safe migrations
import { 
  type AppState, 
  type Habit,
  type HabitLog,
  createDefaultState, 
  isValidAppState,
  SCHEMA_VERSION 
} from './types';

const STORAGE_KEY = 'habit-tracker-state';
const STORAGE_VERSION_KEY = 'habit-tracker-version';

/**
 * Legacy state format (v0) for migration
 */
interface LegacyAppState {
  habits: Array<{
    id: string;
    name: string;
    color: string;
    createdAt: string;
    completedDates: string[];
  }>;
  theme: 'light' | 'dark';
}

/**
 * Migrate from v0 (legacy) to v1
 */
const migrateV0toV1 = (legacyState: LegacyAppState): AppState => {
  const logs: HabitLog[] = [];
  
  // Convert completedDates arrays to HabitLog entries
  legacyState.habits.forEach(habit => {
    if ('completedDates' in habit && Array.isArray(habit.completedDates)) {
      habit.completedDates.forEach(date => {
        logs.push({
          habitId: habit.id,
          date,
          completed: true,
        });
      });
    }
  });

  // Convert habits to new format (remove completedDates)
  const habits: Habit[] = legacyState.habits.map((habit) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { completedDates, ...rest } = habit;
    return rest;
  });

  return {
    version: 1,
    habits,
    logs,
    badges: [],
    settings: {
      theme: legacyState.theme || 'light',
      weekStartsOn: 1,
      notifications: false,
    },
    migratedAt: new Date().toISOString(),
  };
};

/**
 * Run migrations based on version
 */
const migrateState = (data: unknown, currentVersion: number): AppState => {
  // v0 to v1 migration
  if (currentVersion === 0 || !('version' in (data as object))) {
    console.log('Migrating from v0 to v1...');
    return migrateV0toV1(data as LegacyAppState);
  }

  // Future migrations would go here
  // if (currentVersion === 1) {
  //   return migrateV1toV2(data as AppStateV1);
  // }

  return data as AppState;
};

/**
 * Load state from localStorage with safe migration
 */
export const loadState = (): AppState => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    const versionStr = localStorage.getItem(STORAGE_VERSION_KEY);
    
    if (serialized === null) {
      return createDefaultState();
    }

    const data = JSON.parse(serialized);
    const currentVersion = versionStr ? parseInt(versionStr, 10) : 0;

    // Check if migration is needed
    if (currentVersion < SCHEMA_VERSION) {
      console.log(`Migrating storage from v${currentVersion} to v${SCHEMA_VERSION}`);
      const migratedState = migrateState(data, currentVersion);
      saveState(migratedState); // Save migrated state
      return migratedState;
    }

    // Validate state structure
    if (!isValidAppState(data)) {
      console.warn('Invalid state structure, returning default state');
      return createDefaultState();
    }

    return data;
  } catch (err) {
    console.error('Failed to load state:', err);
    return createDefaultState();
  }
};

/**
 * Save state to localStorage
 */
export const saveState = (state: AppState): void => {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
    localStorage.setItem(STORAGE_VERSION_KEY, String(SCHEMA_VERSION));
  } catch (err) {
    console.error('Failed to save state:', err);
  }
};

/**
 * Clear all storage (useful for testing or reset)
 */
export const clearState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_VERSION_KEY);
  } catch (err) {
    console.error('Failed to clear state:', err);
  }
};

/**
 * Export state as JSON (for backup)
 */
export const exportState = (): string => {
  const state = loadState();
  return JSON.stringify(state, null, 2);
};

/**
 * Import state from JSON (for restore)
 */
export const importState = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (!isValidAppState(data)) {
      throw new Error('Invalid state format');
    }
    saveState(data);
    return true;
  } catch (err) {
    console.error('Failed to import state:', err);
    return false;
  }
};

// ==================== CRUD Operations ====================

/**
 * Add a new habit
 */
export const addHabit = (habit: Habit): void => {
  const state = loadState();
  state.habits.push(habit);
  saveState(state);
};

/**
 * Update an existing habit
 */
export const updateHabit = (habitId: string, updates: Partial<Habit>): void => {
  const state = loadState();
  const index = state.habits.findIndex((h) => h.id === habitId);
  if (index === -1) return;
  
  state.habits[index] = { ...state.habits[index], ...updates };
  saveState(state);
};

/**
 * Delete a habit (and optionally its logs)
 */
export const deleteHabit = (habitId: string, deleteLogs = true): void => {
  const state = loadState();
  state.habits = state.habits.filter((h) => h.id !== habitId);
  
  if (deleteLogs) {
    state.logs = state.logs.filter((log) => log.habitId !== habitId);
  }
  
  saveState(state);
};

/**
 * Toggle habit completion for a specific date
 */
export const toggleHabitDate = (habitId: string, date: string): void => {
  const state = loadState();
  const existingLog = state.logs.find(
    (log) => log.habitId === habitId && log.date === date
  );

  if (existingLog) {
    // Toggle completion
    existingLog.completed = !existingLog.completed;
    existingLog.timestamp = new Date().toISOString();
  } else {
    // Create new log entry
    state.logs.push({
      habitId,
      date,
      completed: true,
      timestamp: new Date().toISOString(),
    });
  }

  saveState(state);
};

/**
 * Get logs for a specific habit
 */
export const getHabitLogs = (habitId: string): HabitLog[] => {
  const state = loadState();
  return state.logs.filter((log) => log.habitId === habitId && log.completed);
};

/**
 * Update app settings
 */
export const updateSettings = (updates: Partial<AppState['settings']>): void => {
  const state = loadState();
  state.settings = { ...state.settings, ...updates };
  saveState(state);
};
