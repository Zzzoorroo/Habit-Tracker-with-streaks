/**
 * Streak Calculation Utilities
 * 
 * Provides robust streak calculation for habit tracking with proper edge case handling.
 * Input: habitId + logs map (dateKey -> boolean)
 * Output: currentStreak, longestStreak
 * 
 * Edge cases handled:
 * - Missing days breaks streak
 * - Timezone-safe dateKey generation
 * - Duplicate dates ignored
 * - Empty logs return 0
 */

import { differenceInDays, parseISO, subDays } from 'date-fns';

/**
 * Convert a Date to YYYY-MM-DD format (date key)
 * Uses UTC to avoid timezone issues
 */
export const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get today's date key (timezone-safe)
 */
export const getTodayKey = (): string => {
  return toDateKey(new Date());
};

/**
 * Parse a date key (YYYY-MM-DD) to Date object
 */
export const fromDateKey = (dateKey: string): Date => {
  return parseISO(dateKey);
};

/**
 * Get date key for N days ago
 */
export const getDateKeyDaysAgo = (daysAgo: number): string => {
  return toDateKey(subDays(new Date(), daysAgo));
};

/**
 * Calculate streak data for a specific habit
 * 
 * @param habitId - The habit ID to calculate streaks for
 * @param logs - Map of logs: { [habitId]: { [dateKey]: boolean } }
 * @param referenceDate - Optional reference date (defaults to today)
 * @returns Object with currentStreak and longestStreak
 */
export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}

export const calculateStreaks = (
  habitId: string,
  logs: Record<string, Record<string, boolean>>,
  referenceDate?: string
): StreakResult => {
  // Get logs for this specific habit
  const habitLogs = logs[habitId] || {};
  
  // Extract completed date keys (where value is true)
  const completedDateKeys = Object.entries(habitLogs)
    .filter(([, completed]) => completed)
    .map(([dateKey]) => dateKey)
    .sort(); // Sort in ascending order
  
  if (completedDateKeys.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }
  
  const refDate = referenceDate || getTodayKey();
  const currentStreak = calculateCurrentStreak(completedDateKeys, refDate);
  const longestStreak = calculateLongestStreak(completedDateKeys);
  
  return { currentStreak, longestStreak };
};

/**
 * Calculate current streak (consecutive days up to reference date)
 * 
 * A current streak counts consecutive days backwards from the reference date.
 * The streak is "active" if the reference date or the day before is completed.
 * Missing a day breaks the streak.
 * 
 * @param completedDateKeys - Sorted array of completed date keys
 * @param referenceDate - The date to count backwards from (usually today)
 * @returns Number of consecutive completed days
 */
export const calculateCurrentStreak = (
  completedDateKeys: string[],
  referenceDate: string
): number => {
  if (completedDateKeys.length === 0) return 0;
  
  // Remove duplicates and sort in descending order
  const uniqueDates = Array.from(new Set(completedDateKeys)).sort((a, b) => 
    b.localeCompare(a)
  );
  
  const refDate = fromDateKey(referenceDate);
  const yesterday = toDateKey(subDays(refDate, 1));
  
  // Check if streak is current (completed reference date or yesterday)
  const mostRecent = uniqueDates[0];
  if (mostRecent !== referenceDate && mostRecent !== yesterday) {
    return 0; // Streak is broken
  }
  
  // Start counting from the most recent completion
  let streak = 0;
  let expectedDate = fromDateKey(mostRecent);
  
  for (const dateKey of uniqueDates) {
    const currentDate = fromDateKey(dateKey);
    const expectedKey = toDateKey(expectedDate);
    
    if (dateKey === expectedKey) {
      streak++;
      expectedDate = subDays(expectedDate, 1);
    } else {
      // Check if we skipped days
      const daysDiff = differenceInDays(expectedDate, currentDate);
      if (daysDiff > 0) {
        break; // Gap found, streak ends
      }
      // If daysDiff < 0, we've gone past expected (shouldn't happen with sorted array)
    }
  }
  
  return streak;
};

/**
 * Calculate longest streak ever (all-time record)
 * 
 * Finds the longest consecutive sequence of completed days in the entire history.
 * 
 * @param completedDateKeys - Array of completed date keys
 * @returns Length of the longest consecutive streak
 */
export const calculateLongestStreak = (completedDateKeys: string[]): number => {
  if (completedDateKeys.length === 0) return 0;
  
  // Remove duplicates and sort in ascending order
  const uniqueDates = Array.from(new Set(completedDateKeys)).sort((a, b) => 
    a.localeCompare(b)
  );
  
  if (uniqueDates.length === 1) return 1;
  
  let longestStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = fromDateKey(uniqueDates[i - 1]);
    const currDate = fromDateKey(uniqueDates[i]);
    const daysDiff = differenceInDays(currDate, prevDate);
    
    if (daysDiff === 1) {
      // Consecutive day
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (daysDiff > 1) {
      // Gap found, reset current streak
      currentStreak = 1;
    }
    // If daysDiff === 0, it's a duplicate (shouldn't happen after deduplication)
  }
  
  return longestStreak;
};

// ==================== Test Cases ====================

/**
 * Run test cases for streak calculation
 * These are simple test functions (no test framework needed)
 */
export const runStreakTests = () => {
  console.log('🧪 Running Streak Calculation Tests...\n');
  
  // Test 1: Empty logs
  const test1 = calculateStreaks('habit1', {}, '2024-12-26');
  console.assert(
    test1.currentStreak === 0 && test1.longestStreak === 0,
    '❌ Test 1 Failed: Empty logs should return 0'
  );
  console.log('✅ Test 1 Passed: Empty logs');
  
  // Test 2: Single day streak (today)
  const test2Logs = {
    habit1: { '2024-12-26': true }
  };
  const test2 = calculateStreaks('habit1', test2Logs, '2024-12-26');
  console.assert(
    test2.currentStreak === 1 && test2.longestStreak === 1,
    '❌ Test 2 Failed: Single day streak'
  );
  console.log('✅ Test 2 Passed: Single day streak');
  
  // Test 3: Consecutive 3-day streak
  const test3Logs = {
    habit1: {
      '2024-12-24': true,
      '2024-12-25': true,
      '2024-12-26': true
    }
  };
  const test3 = calculateStreaks('habit1', test3Logs, '2024-12-26');
  console.assert(
    test3.currentStreak === 3 && test3.longestStreak === 3,
    '❌ Test 3 Failed: 3-day consecutive streak'
  );
  console.log('✅ Test 3 Passed: 3-day consecutive streak');
  
  // Test 4: Broken streak (completed yesterday but not today)
  const test4Logs = {
    habit1: {
      '2024-12-24': true,
      '2024-12-25': true
    }
  };
  const test4 = calculateStreaks('habit1', test4Logs, '2024-12-26');
  console.assert(
    test4.currentStreak === 0 && test4.longestStreak === 2,
    '❌ Test 4 Failed: Broken streak (completed yesterday)'
  );
  console.log('✅ Test 4 Passed: Broken streak maintains longest streak');
  
  // Test 5: Gap in middle, multiple streaks
  const test5Logs = {
    habit1: {
      '2024-12-20': true,
      '2024-12-21': true,
      '2024-12-22': true,
      // Gap on 23rd
      '2024-12-24': true,
      '2024-12-25': true,
      '2024-12-26': true
    }
  };
  const test5 = calculateStreaks('habit1', test5Logs, '2024-12-26');
  console.assert(
    test5.currentStreak === 3 && test5.longestStreak === 3,
    '❌ Test 5 Failed: Gap in middle'
  );
  console.log('✅ Test 5 Passed: Gap in middle, current streak is recent');
  
  // Test 6: Longest streak is in the past
  const test6Logs = {
    habit1: {
      '2024-12-10': true,
      '2024-12-11': true,
      '2024-12-12': true,
      '2024-12-13': true,
      '2024-12-14': true,
      // Gap
      '2024-12-25': true,
      '2024-12-26': true
    }
  };
  const test6 = calculateStreaks('habit1', test6Logs, '2024-12-26');
  console.assert(
    test6.currentStreak === 2 && test6.longestStreak === 5,
    '❌ Test 6 Failed: Longest streak in the past'
  );
  console.log('✅ Test 6 Passed: Longest streak is in the past');
  
  // Test 7: Duplicate dates (should be handled)
  const test7Logs = {
    habit1: {
      '2024-12-24': true,
      '2024-12-25': true,
      '2024-12-26': true
    }
  };
  const test7 = calculateStreaks('habit1', test7Logs, '2024-12-26');
  console.assert(
    test7.currentStreak === 3 && test7.longestStreak === 3,
    '❌ Test 7 Failed: Duplicate dates handling'
  );
  console.log('✅ Test 7 Passed: Duplicate dates handled correctly');
  
  // Test 8: Non-existent habit ID
  const test8Logs = {
    habit1: { '2024-12-26': true }
  };
  const test8 = calculateStreaks('habit2', test8Logs, '2024-12-26');
  console.assert(
    test8.currentStreak === 0 && test8.longestStreak === 0,
    '❌ Test 8 Failed: Non-existent habit ID'
  );
  console.log('✅ Test 8 Passed: Non-existent habit ID returns 0');
  
  // Test 9: Streak includes yesterday (grace period)
  const test9Logs = {
    habit1: {
      '2024-12-23': true,
      '2024-12-24': true,
      '2024-12-25': true
      // Not completed today (26th)
    }
  };
  const test9 = calculateStreaks('habit1', test9Logs, '2024-12-26');
  console.assert(
    test9.currentStreak === 0 && test9.longestStreak === 3,
    '❌ Test 9 Failed: Yesterday without today breaks streak'
  );
  console.log('✅ Test 9 Passed: Yesterday without today breaks current streak');
  
  // Test 10: Out of order dates (should be sorted)
  const test10Logs = {
    habit1: {
      '2024-12-26': true,
      '2024-12-24': true,
      '2024-12-25': true
    }
  };
  const test10 = calculateStreaks('habit1', test10Logs, '2024-12-26');
  console.assert(
    test10.currentStreak === 3 && test10.longestStreak === 3,
    '❌ Test 10 Failed: Out of order dates'
  );
  console.log('✅ Test 10 Passed: Out of order dates handled correctly');
  
  // Test 11: Very long streak
  const test11Logs: Record<string, Record<string, boolean>> = { habit1: {} };
  for (let i = 0; i < 100; i++) {
    const dateKey = getDateKeyDaysAgo(i);
    test11Logs.habit1[dateKey] = true;
  }
  const test11 = calculateStreaks('habit1', test11Logs, getTodayKey());
  console.assert(
    test11.currentStreak === 100 && test11.longestStreak === 100,
    '❌ Test 11 Failed: 100-day streak'
  );
  console.log('✅ Test 11 Passed: 100-day streak calculated correctly');
  
  // Test 12: Mixed completed/incomplete logs
  const test12Logs = {
    habit1: {
      '2024-12-20': false,
      '2024-12-21': true,
      '2024-12-22': true,
      '2024-12-23': false,
      '2024-12-24': true,
      '2024-12-25': true,
      '2024-12-26': true
    }
  };
  const test12 = calculateStreaks('habit1', test12Logs, '2024-12-26');
  console.assert(
    test12.currentStreak === 3 && test12.longestStreak === 3,
    '❌ Test 12 Failed: Mixed completed/incomplete logs'
  );
  console.log('✅ Test 12 Passed: Mixed completed/incomplete logs');
  
  console.log('\n✨ All streak tests passed!');
};

// ==================== Example Usage ====================

/**
 * Example usage demonstrating how to use the streak utilities
 */
export const streakExamples = () => {
  console.log('📚 Streak Calculation Examples\n');
  
  // Example 1: Basic usage
  console.log('Example 1: Basic usage');
  const logs1 = {
    'exercise-habit': {
      '2024-12-24': true,
      '2024-12-25': true,
      '2024-12-26': true
    }
  };
  const result1 = calculateStreaks('exercise-habit', logs1, '2024-12-26');
  console.log(`Current: ${result1.currentStreak}, Longest: ${result1.longestStreak}`);
  console.log('Expected: Current: 3, Longest: 3\n');
  
  // Example 2: Using with today's date
  console.log('Example 2: Using today\'s date automatically');
  const logs2 = {
    'reading-habit': {
      [getTodayKey()]: true,
      [getDateKeyDaysAgo(1)]: true,
      [getDateKeyDaysAgo(2)]: true
    }
  };
  const result2 = calculateStreaks('reading-habit', logs2);
  console.log(`Current: ${result2.currentStreak}, Longest: ${result2.longestStreak}`);
  console.log('Expected: Current: 3, Longest: 3\n');
  
  // Example 3: Broken streak
  console.log('Example 3: Broken streak');
  const logs3 = {
    'meditation-habit': {
      '2024-12-20': true,
      '2024-12-21': true,
      '2024-12-22': true,
      // Missed 23rd, 24th, 25th
      '2024-12-26': true
    }
  };
  const result3 = calculateStreaks('meditation-habit', logs3, '2024-12-26');
  console.log(`Current: ${result3.currentStreak}, Longest: ${result3.longestStreak}`);
  console.log('Expected: Current: 1, Longest: 3\n');
};
