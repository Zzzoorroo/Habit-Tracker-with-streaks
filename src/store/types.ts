// Store types and interfaces
// Schema version for safe migrations
export const SCHEMA_VERSION = 1;

/**
 * Represents a single habit to track
 */
export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string; // e.g., 'blue', 'green', 'purple'
  icon?: string; // emoji or icon identifier
  createdAt: string; // ISO 8601 date string
  archived?: boolean;
}

/**
 * Represents a log entry for habit completion
 * Using a separate log model allows for future enhancements like:
 * - Time of completion
 * - Notes per completion
 * - Mood tracking
 */
export interface HabitLog {
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  timestamp?: string; // ISO 8601 timestamp of when logged
  note?: string; // Optional note for this completion
}

/**
 * Badge types that can be earned
 */
export type BadgeType = 
  | 'first_habit'       // Created first habit
  | 'streak_3'          // 3-day streak
  | 'streak_7'          // 7-day streak
  | 'streak_30'         // 30-day streak
  | 'streak_100'        // 100-day streak
  | 'perfect_week'      // All habits completed for 7 days
  | 'perfect_month'     // All habits completed for 30 days
  | 'early_bird'        // 5 completions before 8 AM
  | 'night_owl'         // 5 completions after 10 PM
  | 'consistency_king'  // No missed days for 30 days
  | 'habit_master';     // 10 active habits

/**
 * Badge metadata
 */
export interface Badge {
  type: BadgeType;
  name: string;
  description: string;
  unlockedAt?: string; // ISO 8601 date string when unlocked
  icon: string; // emoji or icon identifier
}

/**
 * User settings and preferences
 */
export interface Settings {
  theme: 'light' | 'dark';
  weekStartsOn: 0 | 1 | 6; // 0 = Sunday, 1 = Monday, 6 = Saturday
  notifications: boolean;
  firstDayOfWeek?: 0 | 1 | 6; // Deprecated in favor of weekStartsOn
}

/**
 * Main application state with versioning for safe migrations
 */
export interface AppState {
  version: number; // Schema version for migrations
  habits: Habit[];
  logs: HabitLog[];
  badges: Badge[];
  settings: Settings;
  migratedAt?: string; // ISO 8601 date string of last migration
}

/**
 * Default state factory
 */
export const createDefaultState = (): AppState => ({
  version: SCHEMA_VERSION,
  habits: [],
  logs: [],
  badges: [],
  settings: {
    theme: 'light',
    weekStartsOn: 1, // Monday
    notifications: false,
  },
});

/**
 * Type guard to check if data is valid AppState
 */
export const isValidAppState = (data: unknown): data is AppState => {
  if (!data || typeof data !== 'object') return false;
  const state = data as Partial<AppState>;
  return (
    typeof state.version === 'number' &&
    Array.isArray(state.habits) &&
    Array.isArray(state.logs) &&
    Array.isArray(state.badges) &&
    typeof state.settings === 'object'
  );
};
