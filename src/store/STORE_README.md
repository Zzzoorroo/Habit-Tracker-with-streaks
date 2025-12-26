# Habits Store - React Context + useReducer

A lightweight, type-safe state management solution for the Habit Tracker app using React Context API and useReducer hook.

## Features

✅ **No external dependencies** - Uses only React built-ins  
✅ **Automatic localStorage persistence** - State syncs on every change  
✅ **Type-safe** - Full TypeScript support with typed actions  
✅ **Optimized data structure** - Logs stored as `Record<habitId, Record<dateKey, boolean>>` for O(1) lookup  
✅ **Automatic badge checking** - Checks for unlocked badges on state changes  
✅ **Helper functions** - Common queries built-in  
✅ **Custom selectors** - Optimized hooks for specific data  

## Quick Start

### 1. Wrap your app with HabitsProvider

```tsx
import { HabitsProvider } from './store/useHabitsStore';

function App() {
  return (
    <HabitsProvider>
      <YourApp />
    </HabitsProvider>
  );
}
```

### 2. Use the store in components

```tsx
import { useHabitsStore, useHabits, useTheme } from './store/useHabitsStore';
import { toDateKey } from './utils/dateUtils';

function MyComponent() {
  const { state, actions, helpers } = useHabitsStore();
  const today = toDateKey(new Date());

  // Add a habit
  const addNewHabit = () => {
    actions.addHabit({
      name: 'Morning Exercise',
      description: 'Do 20 push-ups',
      color: 'blue',
      icon: '💪',
    });
  };

  // Toggle completion for today
  const toggleToday = (habitId: string) => {
    actions.toggleHabitDate(habitId, today);
  };

  // Check if completed
  const isCompleted = helpers.isHabitCompletedOnDate('habit-id', today);

  return (
    <div>
      {state.habits.map(habit => (
        <div key={habit.id}>
          <h3>{habit.name}</h3>
          <button onClick={() => toggleToday(habit.id)}>
            {helpers.isHabitCompletedOnDate(habit.id, today) ? '✓' : 'Mark Complete'}
          </button>
        </div>
      ))}
    </div>
  );
}
```

## API Reference

### useHabitsStore()

Main hook that returns the complete store interface.

```tsx
const { state, dispatch, actions, helpers } = useHabitsStore();
```

#### State

```typescript
interface HabitsState {
  habits: Habit[];                                  // All habits
  logs: Record<string, Record<string, boolean>>;   // { habitId: { dateKey: completed } }
  theme: 'light' | 'dark';                         // Current theme
  unlockedBadges: Badge[];                         // Earned badges
  isLoading: boolean;                              // Loading state
}
```

#### Actions

All actions automatically persist to localStorage and trigger badge checks.

```typescript
actions.addHabit(habit: Omit<Habit, 'id' | 'createdAt'>)
// Creates a new habit with auto-generated id and timestamp

actions.editHabit(id: string, updates: Partial<Habit>)
// Updates habit properties

actions.deleteHabit(id: string)
// Removes habit and all its logs

actions.toggleHabitDate(habitId: string, date: string)
// Toggles completion status for a specific date

actions.checkInHabit(habitId: string, date: string)
// Alias for toggleHabitDate (more semantic)

actions.setTheme(theme: 'light' | 'dark')
// Changes app theme
```

#### Helpers

```typescript
helpers.isHabitCompletedOnDate(habitId: string, date: string): boolean
// Check if a habit was completed on a specific date

helpers.getHabitCompletedDates(habitId: string): string[]
// Get all completed dates for a habit (sorted)

helpers.getAllLogs(): Array<{ habitId: string; date: string; completed: boolean }>
// Get all logs as flat array
```

### Custom Selectors

Optimized hooks for common use cases:

```typescript
const habits = useHabits();
// Returns only active (non-archived) habits

const { theme, setTheme } = useTheme();
// Access theme and setter

const badges = useBadges();
// Returns all unlocked badges

const habit = useHabit(habitId);
// Get a specific habit by id
```

## Architecture

### Data Flow

```
┌─────────────┐
│   Action    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Reducer    │ → Updates state
└──────┬──────┘
       │
       ├──────────────────────┐
       │                      │
       ▼                      ▼
┌─────────────┐      ┌─────────────┐
│ Persist to  │      │ Check Badge │
│ localStorage│      │  Unlocks    │
└─────────────┘      └──────┬──────┘
                            │
                            ▼
                     ┌─────────────┐
                     │ Unlock      │
                     │ Badges      │
                     └─────────────┘
```

### State Structure

**Optimized for UI access:**

```typescript
{
  habits: [
    { id: 'abc', name: 'Exercise', color: 'blue', ... }
  ],
  logs: {
    'abc': {
      '2024-12-26': true,
      '2024-12-25': true,
      '2024-12-24': false
    }
  },
  theme: 'light',
  unlockedBadges: [...],
  isLoading: false
}
```

**Why `Record<habitId, Record<dateKey, boolean>>`?**
- O(1) lookup instead of O(n) filtering
- Easy to check: `state.logs[habitId]?.[date] ?? false`
- Better performance for calendar views

### Persistence Strategy

1. **On mount**: Load from localStorage, transform to optimized structure
2. **On change**: Transform back to storage format, save immediately
3. **Version safe**: Uses existing migration system from `habitStore.ts`

### Badge System

Badges are checked automatically after:
- Adding/editing/deleting habits
- Toggling habit dates

New badges are unlocked and added to state in real-time.

## Examples

See `useHabitsStore.example.tsx` for complete usage examples:

1. **HabitListExample** - Full CRUD with habits
2. **ThemeToggleExample** - Using theme selector
3. **ActiveHabitsExample** - Using custom selector
4. **EditHabitExample** - Editing habits
5. **CalendarExample** - Monthly view with toggle
6. **AppExample** - Complete app structure
7. **StatsExample** - Aggregating data

## Performance Tips

### 1. Use Custom Selectors

Instead of:
```tsx
const { state } = useHabitsStore();
const activeHabits = state.habits.filter(h => !h.archived);
```

Use:
```tsx
const activeHabits = useHabits(); // Only re-renders when active habits change
```

### 2. Memoize Computed Values

```tsx
import { useMemo } from 'react';

const { state, helpers } = useHabitsStore();
const habitStats = useMemo(() => {
  return state.habits.map(habit => ({
    id: habit.id,
    name: habit.name,
    totalCompletions: helpers.getHabitCompletedDates(habit.id).length,
  }));
}, [state.habits, helpers]);
```

### 3. Use Helpers for Checks

Instead of filtering arrays:
```tsx
const isCompleted = helpers.isHabitCompletedOnDate(habitId, date); // O(1)
```

## Migration from localStorage Functions

If you were using `habitStore.ts` functions directly:

**Before:**
```tsx
import { addHabit, toggleHabitDate, loadState } from './store/habitStore';

const state = loadState();
addHabit(newHabit);
toggleHabitDate(habitId, date);
```

**After:**
```tsx
import { useHabitsStore } from './store/useHabitsStore';

const { state, actions } = useHabitsStore();
actions.addHabit(newHabit);
actions.toggleHabitDate(habitId, date);
```

## TypeScript

Full type safety with no `any` types:

```tsx
import { type HabitsState, type HabitsAction } from './store/useHabitsStore';

// All actions are typed
actions.addHabit({
  name: 'Exercise',
  color: 'blue',
  // TypeScript error if required fields missing
});

// State is fully typed
const habits: Habit[] = state.habits;
const logs: Record<string, Record<string, boolean>> = state.logs;
```

## Testing

### Testing Components

```tsx
import { render } from '@testing-library/react';
import { HabitsProvider } from './store/useHabitsStore';

test('renders habit list', () => {
  render(
    <HabitsProvider>
      <HabitList />
    </HabitsProvider>
  );
  // assertions
});
```

### Mocking the Store

```tsx
const mockStore = {
  state: {
    habits: [{ id: '1', name: 'Test', color: 'blue', createdAt: '2024-01-01' }],
    logs: {},
    theme: 'light' as const,
    unlockedBadges: [],
    isLoading: false,
  },
  actions: {
    addHabit: jest.fn(),
    toggleHabitDate: jest.fn(),
    // ... other actions
  },
  helpers: {
    isHabitCompletedOnDate: jest.fn(),
    // ... other helpers
  },
};
```

## Troubleshooting

### "useHabitsStore must be used within a HabitsProvider"

Make sure your component is wrapped in `<HabitsProvider>`:

```tsx
<HabitsProvider>
  <App />
</HabitsProvider>
```

### State not persisting

Check browser console for localStorage errors. The store uses `localStorage.setItem()` which can fail if:
- Storage quota exceeded
- Private browsing mode restrictions
- Browser extensions blocking

### Badges not unlocking

Badges are checked automatically. If not working:
1. Check `checkBadgeUnlocks()` in `badgeUtils.ts`
2. Verify logs are being saved correctly
3. Check browser console for errors

## Future Enhancements

Potential additions:
- `useHabitStreak(habitId)` selector
- `useHabitsByDate(date)` selector  
- Undo/redo support with action history
- Optimistic updates for better UX
- WebSocket sync for multi-device
- IndexedDB for larger datasets

## License

Part of the Habit Tracker project.
