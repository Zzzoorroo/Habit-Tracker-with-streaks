// Simple state management with localStorage
import { type AppState, type Habit } from './types';

const STORAGE_KEY = 'habit-tracker-state';

export const loadState = (): AppState => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized === null) {
      return {
        habits: [],
        theme: 'light',
      };
    }
    return JSON.parse(serialized);
  } catch (err) {
    console.error('Failed to load state:', err);
    return {
      habits: [],
      theme: 'light',
    };
  }
};

export const saveState = (state: AppState): void => {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (err) {
    console.error('Failed to save state:', err);
  }
};

export const addHabit = (habit: Habit): void => {
  const state = loadState();
  state.habits.push(habit);
  saveState(state);
};

export const toggleHabitDate = (habitId: string, date: string): void => {
  const state = loadState();
  const habit = state.habits.find((h) => h.id === habitId);
  if (!habit) return;

  const index = habit.completedDates.indexOf(date);
  if (index > -1) {
    habit.completedDates.splice(index, 1);
  } else {
    habit.completedDates.push(date);
  }
  saveState(state);
};
