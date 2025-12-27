// Date utility functions using date-fns
import { 
  format, 
  parseISO, 
  endOfMonth, 
  eachDayOfInterval,
  isWithinInterval,
  differenceInDays,
  subDays,
  startOfWeek,
  endOfWeek,
} from 'date-fns';

/**
 * Convert a Date to YYYY-MM-DD format (date key)
 * This is the canonical format for storing dates
 */
export const toDateKey = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd');
};

/**
 * Parse a date key (YYYY-MM-DD) to Date object
 */
export const fromDateKey = (dateKey: string): Date => {
  return parseISO(dateKey);
};

/**
 * Get today's date key
 */
export const getTodayKey = (): string => {
  return toDateKey(new Date());
};

/**
 * Format date for display
 */
export const formatDisplayDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM dd, yyyy');
};

/**
 * Format date as "Mon, Jan 1"
 */
export const formatShortDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEE, MMM d');
};

// ==================== Streak Calculation ====================

/**
 * Calculate the current streak for a habit based on completed dates
 * A streak is the number of consecutive days (ending today or in the past)
 * where the habit was completed.
 * 
 * @param completedDates - Array of date keys (YYYY-MM-DD) when habit was completed
 * @returns Current streak count
 */
export const calculateStreak = (completedDates: string[]): number => {
  if (completedDates.length === 0) return 0;

  // Sort dates in descending order (most recent first)
  const sorted = [...completedDates].sort((a, b) => b.localeCompare(a));
  const today = getTodayKey();
  const yesterday = toDateKey(subDays(new Date(), 1));

  // Check if the streak is current (completed today or yesterday)
  if (sorted[0] !== today && sorted[0] !== yesterday) {
    return 0; // Streak broken
  }

  let streak = 0;
  let currentDate = sorted[0] === today ? new Date() : subDays(new Date(), 1);

  // Count consecutive days backwards
  for (const dateKey of sorted) {
    const expectedKey = toDateKey(currentDate);
    if (dateKey === expectedKey) {
      streak++;
      currentDate = subDays(currentDate, 1);
    } else {
      break; // Streak broken
    }
  }

  return streak;
};

/**
 * Calculate the longest streak ever for a habit
 * 
 * @param completedDates - Array of date keys (YYYY-MM-DD)
 * @returns Longest streak count
 */
export const calculateLongestStreak = (completedDates: string[]): number => {
  if (completedDates.length === 0) return 0;

  const sorted = [...completedDates].sort((a, b) => a.localeCompare(b));
  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prevDate = fromDateKey(sorted[i - 1]);
    const currDate = fromDateKey(sorted[i]);
    const daysDiff = differenceInDays(currDate, prevDate);

    if (daysDiff === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (daysDiff > 1) {
      currentStreak = 1;
    }
    // If daysDiff === 0, it's a duplicate, ignore it
  }

  return longestStreak;
};

// ==================== Monthly Grid Range ====================

/**
 * Get the date range for a monthly calendar grid
 * Includes padding days from previous/next month to fill the grid
 * 
 * @param year - Year (e.g., 2024)
 * @param month - Month (0-11, where 0 = January)
 * @param weekStartsOn - Day of week that starts the week (0 = Sunday, 1 = Monday)
 * @returns Array of date keys covering the calendar grid
 */
export const getMonthlyGridRange = (
  year: number,
  month: number,
  weekStartsOn: 0 | 1 | 6 = 1
): string[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = endOfMonth(firstDay);

  // Get the start of the week containing the first day
  const gridStart = startOfWeek(firstDay, { weekStartsOn });
  
  // Get the end of the week containing the last day
  const gridEnd = endOfWeek(lastDay, { weekStartsOn });

  // Generate all dates in the range
  const dates = eachDayOfInterval({ start: gridStart, end: gridEnd });
  
  return dates.map(toDateKey);
};

/**
 * Get all dates in a specific month (without padding)
 * 
 * @param year - Year (e.g., 2024)
 * @param month - Month (0-11, where 0 = January)
 * @returns Array of date keys for the month
 */
export const getMonthDates = (year: number, month: number): string[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = endOfMonth(firstDay);
  const dates = eachDayOfInterval({ start: firstDay, end: lastDay });
  return dates.map(toDateKey);
};

/**
 * Check if a date is in a specific month
 */
export const isInMonth = (dateKey: string, year: number, month: number): boolean => {
  const date = fromDateKey(dateKey);
  const firstDay = new Date(year, month, 1);
  const lastDay = endOfMonth(firstDay);
  return isWithinInterval(date, { start: firstDay, end: lastDay });
};

/**
 * Get the current month and year
 */
export const getCurrentMonthYear = (): { year: number; month: number } => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
  };
};

// ==================== Utility Functions ====================

/**
 * Check if two dates are the same day
 */
export const isSameDayKey = (dateKey1: string, dateKey2: string): boolean => {
  return dateKey1 === dateKey2;
};

/**
 * Get date keys for the last N days (including today)
 */
export const getLastNDays = (n: number): string[] => {
  const today = new Date();
  const dates: string[] = [];
  
  for (let i = 0; i < n; i++) {
    dates.push(toDateKey(subDays(today, i)));
  }
  
  return dates;
};

/**
 * Get date keys for the current week
 */
export const getCurrentWeekDates = (weekStartsOn: 0 | 1 | 6 = 1): string[] => {
  const today = new Date();
  const start = startOfWeek(today, { weekStartsOn });
  const end = endOfWeek(today, { weekStartsOn });
  const dates = eachDayOfInterval({ start, end });
  return dates.map(toDateKey);
};

/**
 * Calculate completion rate for a date range
 */
export const calculateCompletionRate = (
  completedDates: string[],
  dateRange: string[]
): number => {
  if (dateRange.length === 0) return 0;
  
  const completedCount = dateRange.filter(date => 
    completedDates.includes(date)
  ).length;
  
  return (completedCount / dateRange.length) * 100;
};
