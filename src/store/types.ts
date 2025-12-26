// Store types and interfaces
export interface Habit {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  completedDates: string[];
}

export interface AppState {
  habits: Habit[];
  theme: 'light' | 'dark';
}
