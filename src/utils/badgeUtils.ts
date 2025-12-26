// Badge unlock rules and utilities
import { type Badge, type BadgeType, type Habit, type HabitLog } from '../store/types';
import { calculateStreak, getLastNDays } from './dateUtils';

/**
 * Badge definitions with metadata
 */
export const BADGE_DEFINITIONS: Record<BadgeType, Omit<Badge, 'unlockedAt'>> = {
  first_habit: {
    type: 'first_habit',
    name: 'Getting Started',
    description: 'Created your first habit',
    icon: '🌱',
  },
  streak_3: {
    type: 'streak_3',
    name: '3-Day Streak',
    description: 'Completed a habit for 3 days in a row',
    icon: '🔥',
  },
  streak_7: {
    type: 'streak_7',
    name: 'Week Warrior',
    description: 'Completed a habit for 7 days in a row',
    icon: '⚡',
  },
  streak_30: {
    type: 'streak_30',
    name: 'Monthly Master',
    description: 'Completed a habit for 30 days in a row',
    icon: '🏆',
  },
  streak_100: {
    type: 'streak_100',
    name: 'Century Club',
    description: 'Completed a habit for 100 days in a row',
    icon: '👑',
  },
  perfect_week: {
    type: 'perfect_week',
    name: 'Perfect Week',
    description: 'Completed all habits every day for a week',
    icon: '💯',
  },
  perfect_month: {
    type: 'perfect_month',
    name: 'Perfect Month',
    description: 'Completed all habits every day for 30 days',
    icon: '🌟',
  },
  early_bird: {
    type: 'early_bird',
    name: 'Early Bird',
    description: 'Completed 5 habits before 8 AM',
    icon: '🌅',
  },
  night_owl: {
    type: 'night_owl',
    name: 'Night Owl',
    description: 'Completed 5 habits after 10 PM',
    icon: '🦉',
  },
  consistency_king: {
    type: 'consistency_king',
    name: 'Consistency King',
    description: 'No missed days for any habit in 30 days',
    icon: '🎯',
  },
  habit_master: {
    type: 'habit_master',
    name: 'Habit Master',
    description: 'Maintained 10 active habits',
    icon: '🧙‍♂️',
  },
};

/**
 * Check if "First Habit" badge should be unlocked
 */
const checkFirstHabit = (habits: Habit[]): boolean => {
  return habits.length >= 1;
};

/**
 * Check if any habit has reached a specific streak length
 */
const checkStreakBadge = (
  habits: Habit[],
  logs: HabitLog[],
  requiredStreak: number
): boolean => {
  for (const habit of habits) {
    const habitLogs = logs
      .filter(log => log.habitId === habit.id && log.completed)
      .map(log => log.date);
    
    const streak = calculateStreak(habitLogs);
    if (streak >= requiredStreak) {
      return true;
    }
  }
  return false;
};

/**
 * Check if all habits were completed for N consecutive days
 */
const checkPerfectStreak = (
  habits: Habit[],
  logs: HabitLog[],
  days: number
): boolean => {
  if (habits.length === 0) return false;

  const lastNDays = getLastNDays(days);
  
  // Check if every habit was completed on every day
  for (const habit of habits) {
    if (habit.archived) continue; // Skip archived habits
    
    const habitLogs = new Set(
      logs
        .filter(log => log.habitId === habit.id && log.completed)
        .map(log => log.date)
    );
    
    // Check if all days are covered
    for (const day of lastNDays) {
      if (!habitLogs.has(day)) {
        return false;
      }
    }
  }
  
  return true;
};

/**
 * Check if user has completed 5 habits before 8 AM
 */
const checkEarlyBird = (logs: HabitLog[]): boolean => {
  const earlyLogs = logs.filter(log => {
    if (!log.timestamp) return false;
    const hour = new Date(log.timestamp).getHours();
    return hour < 8 && log.completed;
  });
  return earlyLogs.length >= 5;
};

/**
 * Check if user has completed 5 habits after 10 PM
 */
const checkNightOwl = (logs: HabitLog[]): boolean => {
  const lateLogs = logs.filter(log => {
    if (!log.timestamp) return false;
    const hour = new Date(log.timestamp).getHours();
    return hour >= 22 && log.completed;
  });
  return lateLogs.length >= 5;
};

/**
 * Check if user has no missed days for 30 days
 */
const checkConsistencyKing = (habits: Habit[], logs: HabitLog[]): boolean => {
  if (habits.length === 0) return false;

  const last30Days = getLastNDays(30);
  const activeHabits = habits.filter(h => !h.archived);
  
  // For each active habit, check if all 30 days are logged
  for (const habit of activeHabits) {
    const habitLogs = new Set(
      logs
        .filter(log => log.habitId === habit.id && log.completed)
        .map(log => log.date)
    );
    
    // Check if habit was created before the 30-day window
    const habitCreatedDate = new Date(habit.createdAt);
    const oldestDateInWindow = new Date(last30Days[last30Days.length - 1]);
    
    if (habitCreatedDate > oldestDateInWindow) {
      // Habit is too new, check only from creation date
      const relevantDays = last30Days.filter(day => {
        const dayDate = new Date(day);
        return dayDate >= habitCreatedDate;
      });
      
      for (const day of relevantDays) {
        if (!habitLogs.has(day)) {
          return false;
        }
      }
    } else {
      // Habit existed for full window
      for (const day of last30Days) {
        if (!habitLogs.has(day)) {
          return false;
        }
      }
    }
  }
  
  return true;
};

/**
 * Check if user has 10 or more active habits
 */
const checkHabitMaster = (habits: Habit[]): boolean => {
  const activeHabits = habits.filter(h => !h.archived);
  return activeHabits.length >= 10;
};

/**
 * Check all badge unlock conditions and return newly unlocked badges
 * 
 * @param habits - All habits
 * @param logs - All habit logs
 * @param currentBadges - Badges already unlocked
 * @returns Array of newly unlocked badge types
 */
export const checkBadgeUnlocks = (
  habits: Habit[],
  logs: HabitLog[],
  currentBadges: Badge[]
): BadgeType[] => {
  const unlockedTypes = new Set(currentBadges.map(b => b.type));
  const newlyUnlocked: BadgeType[] = [];

  // Helper to check and add badge
  const checkAndAdd = (type: BadgeType, condition: boolean) => {
    if (condition && !unlockedTypes.has(type)) {
      newlyUnlocked.push(type);
    }
  };

  // Check all badge conditions
  checkAndAdd('first_habit', checkFirstHabit(habits));
  checkAndAdd('streak_3', checkStreakBadge(habits, logs, 3));
  checkAndAdd('streak_7', checkStreakBadge(habits, logs, 7));
  checkAndAdd('streak_30', checkStreakBadge(habits, logs, 30));
  checkAndAdd('streak_100', checkStreakBadge(habits, logs, 100));
  checkAndAdd('perfect_week', checkPerfectStreak(habits, logs, 7));
  checkAndAdd('perfect_month', checkPerfectStreak(habits, logs, 30));
  checkAndAdd('early_bird', checkEarlyBird(logs));
  checkAndAdd('night_owl', checkNightOwl(logs));
  checkAndAdd('consistency_king', checkConsistencyKing(habits, logs));
  checkAndAdd('habit_master', checkHabitMaster(habits));

  return newlyUnlocked;
};

/**
 * Create a Badge object from a badge type
 */
export const createBadge = (type: BadgeType): Badge => {
  const definition = BADGE_DEFINITIONS[type];
  return {
    ...definition,
    unlockedAt: new Date().toISOString(),
  };
};

/**
 * Get badge progress for display (e.g., "7/30 days")
 * Returns null if badge is already unlocked or not applicable
 */
export const getBadgeProgress = (
  type: BadgeType,
  habits: Habit[],
  logs: HabitLog[],
  isUnlocked: boolean
): { current: number; required: number; label: string } | null => {
  if (isUnlocked) return null;

  switch (type) {
    case 'streak_3':
    case 'streak_7':
    case 'streak_30':
    case 'streak_100': {
      const requiredStreak = parseInt(type.split('_')[1], 10);
      let maxStreak = 0;
      
      for (const habit of habits) {
        const habitLogs = logs
          .filter(log => log.habitId === habit.id && log.completed)
          .map(log => log.date);
        const streak = calculateStreak(habitLogs);
        maxStreak = Math.max(maxStreak, streak);
      }
      
      return {
        current: Math.min(maxStreak, requiredStreak),
        required: requiredStreak,
        label: 'days',
      };
    }
    
    case 'habit_master': {
      const activeHabits = habits.filter(h => !h.archived).length;
      return {
        current: Math.min(activeHabits, 10),
        required: 10,
        label: 'habits',
      };
    }
    
    default:
      return null;
  }
};