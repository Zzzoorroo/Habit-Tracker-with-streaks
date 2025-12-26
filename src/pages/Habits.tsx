// Habits page - Full habit management with CRUD operations
import { type FC, useState } from 'react';
import { useHabitsStore } from '../store/useHabitsStore';
import { type Habit } from '../store/types';
import { format } from 'date-fns';

// Color options for habits
const HABIT_COLORS = [
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { value: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
  { value: 'gray', label: 'Gray', class: 'bg-gray-500' },
];

const Habits: FC = () => {
  const { state, actions } = useHabitsStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [color, setColor] = useState('blue');
  const [error, setError] = useState('');

  // Get active habits (non-archived)
  const habits = state.habits.filter(h => !h.archived);

  // Validation function
  const validateName = (habitName: string, existingHabitId?: string): string => {
    if (!habitName.trim()) {
      return 'Habit name is required';
    }
    if (habitName.trim().length < 1 || habitName.trim().length > 30) {
      return 'Habit name must be between 1 and 30 characters';
    }
    // Check for duplicates (case-insensitive)
    const isDuplicate = habits.some(h => 
      h.name.toLowerCase() === habitName.trim().toLowerCase() && 
      h.id !== existingHabitId
    );
    if (isDuplicate) {
      return 'A habit with this name already exists';
    }
    return '';
  };

  // Handle add habit
  const handleAdd = () => {
    setError('');
    setName('');
    setColor('blue');
    setShowAddModal(true);
  };

  const handleAddSubmit = () => {
    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    actions.addHabit({
      name: name.trim(),
      color,
    });
    setShowAddModal(false);
    setName('');
    setColor('blue');
    setError('');
  };

  // Handle edit habit
  const handleEdit = (habit: Habit) => {
    setSelectedHabit(habit);
    setName(habit.name);
    setColor(habit.color);
    setError('');
    setShowEditModal(true);
  };

  const handleEditSubmit = () => {
    if (!selectedHabit) return;
    
    const validationError = validateName(name, selectedHabit.id);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    actions.editHabit(selectedHabit.id, {
      name: name.trim(),
      color,
    });
    setShowEditModal(false);
    setSelectedHabit(null);
    setName('');
    setColor('blue');
    setError('');
  };

  // Handle delete habit
  const handleDelete = (habit: Habit) => {
    setSelectedHabit(habit);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedHabit) return;
    actions.deleteHabit(selectedHabit.id);
    setShowDeleteModal(false);
    setSelectedHabit(null);
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Habits</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          aria-label="Add new habit"
        >
          + Add Habit
        </button>
      </div>

      {/* Habits List */}
      {habits.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No habits yet. Create your first habit to get started!</p>
          <button
            onClick={handleAdd}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
          >
            Create First Habit
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`w-4 h-4 rounded-full ${HABIT_COLORS.find(c => c.value === habit.color)?.class || 'bg-blue-500'}`}
                    aria-label={`Color: ${habit.color}`}
                  />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {habit.name}
                  </h3>
                </div>
                <div className="flex gap-2 ml-2">
                  <button
                    onClick={() => handleEdit(habit)}
                    className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    aria-label={`Edit ${habit.name}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(habit)}
                    className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    aria-label={`Delete ${habit.name}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Created: {format(new Date(habit.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Add New Habit</h2>
            
            <div className="space-y-4">
              {/* Name Input */}
              <div>
                <label htmlFor="habit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Habit Name *
                </label>
                <input
                  id="habit-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleAddSubmit)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., Morning Exercise"
                  maxLength={30}
                  autoFocus
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {name.length}/30 characters
                </p>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {HABIT_COLORS.map((colorOption) => (
                    <button
                      key={colorOption.value}
                      onClick={() => setColor(colorOption.value)}
                      className={`p-3 rounded-md border-2 transition-all ${
                        color === colorOption.value
                          ? 'border-blue-600 dark:border-blue-400 scale-105'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      aria-label={`Select ${colorOption.label} color`}
                    >
                      <div className={`w-full h-6 rounded ${colorOption.class}`} />
                      <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 block">{colorOption.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setName('');
                  setColor('blue');
                  setError('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
              >
                Add Habit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Habit Modal */}
      {showEditModal && selectedHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Edit Habit</h2>
            
            <div className="space-y-4">
              {/* Name Input */}
              <div>
                <label htmlFor="edit-habit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Habit Name *
                </label>
                <input
                  id="edit-habit-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleEditSubmit)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., Morning Exercise"
                  maxLength={30}
                  autoFocus
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {name.length}/30 characters
                </p>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {HABIT_COLORS.map((colorOption) => (
                    <button
                      key={colorOption.value}
                      onClick={() => setColor(colorOption.value)}
                      className={`p-3 rounded-md border-2 transition-all ${
                        color === colorOption.value
                          ? 'border-blue-600 dark:border-blue-400 scale-105'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      aria-label={`Select ${colorOption.label} color`}
                    >
                      <div className={`w-full h-6 rounded ${colorOption.class}`} />
                      <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 block">{colorOption.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedHabit(null);
                  setName('');
                  setColor('blue');
                  setError('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Delete Habit</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete "<strong>{selectedHabit.name}</strong>"? This action cannot be undone and all associated data will be permanently removed.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedHabit(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Habits;
