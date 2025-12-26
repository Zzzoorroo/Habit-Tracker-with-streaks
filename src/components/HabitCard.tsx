// HabitCard component
import { type FC } from 'react';
import clsx from 'clsx';

interface HabitCardProps {
  name: string;
  color: string;
  streak: number;
  onToggle: () => void;
  isCompleted: boolean;
}

const HabitCard: FC<HabitCardProps> = ({ name, color, streak, onToggle, isCompleted }) => {
  return (
    <div className={clsx('p-4 rounded-lg shadow-md border-2', `border-${color}-500`)}>
      <h3 className="text-xl font-semibold mb-2">{name}</h3>
      <p className="text-sm text-gray-600 mb-3">Streak: {streak} days</p>
      <button
        onClick={onToggle}
        className={clsx(
          'px-4 py-2 rounded-md font-medium transition-colors',
          isCompleted
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        )}
      >
        {isCompleted ? 'Completed' : 'Mark Complete'}
      </button>
    </div>
  );
};

export default HabitCard;
