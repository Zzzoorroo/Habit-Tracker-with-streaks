# Habit Tracker Architecture Documentation

## Overview

This document outlines the scalable architecture for the Habit Tracker application, including type definitions, storage strategy, and utility functions.

---

## 📋 Type System

### Core Types

#### `Habit`
Represents a single habit to track.

```typescript
interface Habit {
  id: string;                // Unique identifier (nanoid)
  name: string;              // Habit name
  description?: string;      // Optional description
  color: string;             // Color identifier for UI
  icon?: string;             // Emoji or icon
  createdAt: string;         // ISO 8601 date string
  archived?: boolean;        // Soft delete flag
}
```

#### `HabitLog`
Represents a completion record. Using a separate log model (instead of `completedDates` array) enables:
- Timestamps for time-based badges
- Notes per completion
- Future enhancements (mood tracking, etc.)

```typescript
interface HabitLog {
  habitId: string;           // Reference to Habit
  date: string;              // YYYY-MM-DD format
  completed: boolean;        // Completion status
  timestamp?: string;        // ISO 8601 timestamp
  note?: string;             // Optional note
}
```

#### `Badge`
Represents an achievement badge.

```typescript
type BadgeType = 
  | 'first_habit'       | 'streak_3'          | 'streak_7' 
  | 'streak_30'         | 'streak_100'        | 'perfect_week'
  | 'perfect_month'     | 'early_bird'        | 'night_owl'
  | 'consistency_king'  | 'habit_master';

interface Badge {
  type: BadgeType;
  name: string;
  description: string;
  unlockedAt?: string;       // ISO 8601 date when unlocked
  icon: string;
}
```

#### `AppState`
Root state with schema versioning.

```typescript
interface AppState {
  version: number;           // Schema version for migrations
  habits: Habit[];
  logs: HabitLog[];
  badges: Badge[];
  settings: Settings;
  migratedAt?: string;       // Migration timestamp
}
```

---

## 💾 Storage Strategy

### Versioned Schema with Safe Migrations

**Key Features:**
- Schema version tracking (`SCHEMA_VERSION`)
- Automatic migration from legacy formats
- Validation before loading
- Safe fallback to default state

**Storage Keys:**
- `habit-tracker-state` - Main state object
- `habit-tracker-version` - Schema version number

### Migration Flow

```
┌─────────────┐
│ Load from   │
│ localStorage│
└──────┬──────┘
       │
       ▼
┌─────────────┐     No      ┌─────────────┐
│ Exists?     │────────────▶│ Return      │
└──────┬──────┘             │ Default     │
       │ Yes                 └─────────────┘
       ▼
┌─────────────┐
│ Parse JSON  │
└──────┬──────┘
       │
       ▼
┌─────────────┐     Yes     ┌─────────────┐
│ Version <   │────────────▶│ Run         │
│ Current?    │             │ Migration   │
└──────┬──────┘             └──────┬──────┘
       │ No                        │
       │                           ▼
       │                  ┌─────────────┐
       │                  │ Save        │
       │                  │ Migrated    │
       │                  └──────┬──────┘
       │                         │
       └─────────────────────────┘
                │
                ▼
       ┌─────────────┐
       │ Validate    │
       │ Structure   │
       └──────┬──────┘
              │
              ▼
       ┌─────────────┐
       │ Return State│
       └─────────────┘
```

### Example: v0 to v1 Migration

**v0 (Legacy):**
```json
{
  "habits": [
    {
      "id": "abc",
      "name": "Exercise",
      "completedDates": ["2024-01-01", "2024-01-02"]
    }
  ],
  "theme": "light"
}
```

**v1 (Current):**
```json
{
  "version": 1,
  "habits": [
    {
      "id": "abc",
      "name": "Exercise",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "logs": [
    { "habitId": "abc", "date": "2024-01-01", "completed": true },
    { "habitId": "abc", "date": "2024-01-02", "completed": true }
  ],
  "badges": [],
  "settings": {
    "theme": "light",
    "weekStartsOn": 1,
    "notifications": false
  }
}
```

---

## 🛠️ Utility Functions

### Date Utilities (`dateUtils.ts`)

#### Date Key Functions
```typescript
toDateKey(date: Date | string): string
// Converts to YYYY-MM-DD format
// Example: toDateKey(new Date()) → "2024-12-26"

fromDateKey(dateKey: string): Date
// Parses YYYY-MM-DD to Date object

getTodayKey(): string
// Returns today's date key
```

#### Streak Calculation
```typescript
calculateStreak(completedDates: string[]): number
```

**Algorithm:**
1. Sort dates descending (most recent first)
2. Check if streak is current (today or yesterday)
3. Count consecutive days backwards from today
4. Return streak count

**Examples:**
- `["2024-12-26", "2024-12-25", "2024-12-24"]` → `3` (current streak)
- `["2024-12-24", "2024-12-23"]` → `0` (streak broken, not today/yesterday)
- `["2024-12-26", "2024-12-24"]` → `1` (gap on 12-25)

```typescript
calculateLongestStreak(completedDates: string[]): number
```
Calculates the longest streak ever recorded.

#### Monthly Grid Range
```typescript
getMonthlyGridRange(
  year: number, 
  month: number, 
  weekStartsOn: 0 | 1 | 6
): string[]
```

Returns date keys for a calendar grid including padding from previous/next months.

**Example:** December 2024, week starts Monday
```
     Mo Tu We Th Fr Sa Su
Nov  25 26 27 28 29 30  1   ← Padding from November
Dec   2  3  4  5  6  7  8
     ...
     30 31  1  2  3  4  5   ← Padding into January
```

```typescript
getMonthDates(year: number, month: number): string[]
// Returns only dates within the month (no padding)

isInMonth(dateKey: string, year: number, month: number): boolean
// Checks if date belongs to specific month
```

#### Additional Utilities
```typescript
getLastNDays(n: number): string[]
// Returns date keys for last N days including today

getCurrentWeekDates(weekStartsOn?: 0 | 1 | 6): string[]
// Returns date keys for current week

calculateCompletionRate(
  completedDates: string[], 
  dateRange: string[]
): number
// Returns completion percentage (0-100)
```

---

### Badge Utilities (`badgeUtils.ts`)

#### Badge Unlock Rules

| Badge Type | Unlock Condition |
|------------|------------------|
| `first_habit` | Create first habit |
| `streak_3` | 3-day streak on any habit |
| `streak_7` | 7-day streak on any habit |
| `streak_30` | 30-day streak on any habit |
| `streak_100` | 100-day streak on any habit |
| `perfect_week` | All habits completed for 7 days |
| `perfect_month` | All habits completed for 30 days |
| `early_bird` | 5 completions before 8 AM |
| `night_owl` | 5 completions after 10 PM |
| `consistency_king` | No missed days for 30 days |
| `habit_master` | 10+ active habits |

#### Key Functions

```typescript
checkBadgeUnlocks(
  habits: Habit[],
  logs: HabitLog[],
  currentBadges: Badge[]
): BadgeType[]
```
Checks all conditions and returns newly unlocked badge types.

```typescript
createBadge(type: BadgeType): Badge
// Creates a Badge object with unlock timestamp

getBadgeProgress(
  type: BadgeType,
  habits: Habit[],
  logs: HabitLog[],
  isUnlocked: boolean
): { current: number; required: number; label: string } | null
// Returns progress toward unlocking (e.g., "7/30 days")
```

---

## 📊 Data Flow

### Adding a Habit
```
User Input → addHabit() → Update AppState → Save to localStorage
                              ↓
                      Check Badge Unlocks
                              ↓
                      Update Badges if needed
```

### Logging a Completion
```
User Action → toggleHabitDate() → Create/Update HabitLog
                                        ↓
                                Calculate New Streak
                                        ↓
                                Check Badge Unlocks
                                        ↓
                                Save AppState
```

### Monthly Calendar Display
```
Select Month/Year → getMonthlyGridRange()
                            ↓
                    Get Logs for Date Range
                            ↓
                    Render Calendar with Completions
```

---

## 🔒 Type Safety

All functions are fully typed with TypeScript:
- Pure functions (no side effects) for calculations
- Immutable data transformations
- Proper null/undefined handling
- Date validation and parsing

---

## 🚀 Scalability Considerations

### Current Architecture
- ✅ Versioned schema allows adding new fields
- ✅ Separate logs enable rich features without breaking changes
- ✅ Badge system is extensible (add new types easily)
- ✅ localStorage is sufficient for single-user app

### Future Enhancements
- **Cloud Sync:** AppState structure can be serialized to API
- **Analytics:** HabitLog with timestamps enables detailed insights
- **Reminders:** Settings can be extended with notification preferences
- **Collaboration:** Habit model can add `sharedWith` field
- **Custom Badges:** Badge system supports user-defined achievements

---

## 📝 Usage Examples

### Creating a Habit
```typescript
import { nanoid } from 'nanoid';
import { addHabit } from './store/habitStore';

const newHabit: Habit = {
  id: nanoid(),
  name: 'Morning Exercise',
  description: 'Do 20 push-ups',
  color: 'blue',
  icon: '💪',
  createdAt: new Date().toISOString(),
};

addHabit(newHabit);
```

### Calculating Streak
```typescript
import { getHabitLogs } from './store/habitStore';
import { calculateStreak } from './utils/dateUtils';

const logs = getHabitLogs('habit-id');
const completedDates = logs.map(log => log.date);
const currentStreak = calculateStreak(completedDates);

console.log(`Current streak: ${currentStreak} days`);
```

### Checking Badge Unlocks
```typescript
import { loadState, saveState } from './store/habitStore';
import { checkBadgeUnlocks, createBadge } from './utils/badgeUtils';

const state = loadState();
const newBadges = checkBadgeUnlocks(state.habits, state.logs, state.badges);

newBadges.forEach(type => {
  state.badges.push(createBadge(type));
  console.log(`🎉 New badge unlocked: ${type}`);
});

saveState(state);
```

### Generating Monthly Calendar
```typescript
import { getMonthlyGridRange } from './utils/dateUtils';
import { loadState } from './store/habitStore';

const state = loadState();
const { year, month } = { year: 2024, month: 11 }; // December
const dateKeys = getMonthlyGridRange(year, month, 1); // Week starts Monday

// For each date, check if habits were completed
dateKeys.forEach(dateKey => {
  const completed = state.logs.filter(
    log => log.date === dateKey && log.completed
  );
  console.log(`${dateKey}: ${completed.length} habits completed`);
});
```

---

## 🧪 Testing Strategy

### Unit Tests (Recommended)
- ✅ Pure functions in `dateUtils.ts` (easy to test)
- ✅ Badge unlock rules in `badgeUtils.ts`
- ✅ Migration logic in `habitStore.ts`

### Integration Tests
- ✅ Full flow: create habit → log completion → check badges
- ✅ Storage migration scenarios
- ✅ Edge cases (empty state, corrupted data)

---

## 📖 Summary

This architecture provides:

1. **Type Safety:** Comprehensive TypeScript types for all entities
2. **Versioned Storage:** Safe migrations with backward compatibility
3. **Pure Utilities:** Testable functions for dates, streaks, and badges
4. **Scalability:** Easy to extend with new features
5. **Clear Separation:** Types, storage, and business logic are modular

Next steps: Implement UI components using these foundations!
