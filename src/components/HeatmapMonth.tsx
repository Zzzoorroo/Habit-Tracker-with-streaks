// Monthly heatmap component for Statistics page
import { type FC, useState } from 'react';
import { format, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { toDateKey, isInMonth } from '../utils/dateUtils';

interface HeatmapMonthProps {
  year: number;
  month: number; // 0-11
  logs: Record<string, Record<string, boolean>>; // habitId -> dateKey -> completed
  habits: Array<{ id: string; name: string; archived?: boolean }>;
}

/**
 * Monthly heatmap showing daily completion counts
 * Displays a calendar grid with color intensity based on habits completed per day
 */
const HeatmapMonth: FC<HeatmapMonthProps> = ({ year, month, logs, habits }) => {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Filter out archived habits
  const activeHabits = habits.filter(h => !h.archived);
  const totalHabits = activeHabits.length;

  // Generate calendar grid (7 columns, up to 6 rows)
  const firstDay = new Date(year, month, 1);
  const lastDay = endOfMonth(firstDay);
  const gridStart = startOfWeek(firstDay, { weekStartsOn: 1 }); // Week starts on Monday
  const gridEnd = endOfWeek(lastDay, { weekStartsOn: 1 });
  const gridDates = eachDayOfInterval({ start: gridStart, end: gridEnd });

  // Calculate completion count for a given date
  const getCompletionCount = (dateKey: string): number => {
    let count = 0;
    for (const habit of activeHabits) {
      if (logs[habit.id]?.[dateKey]) {
        count++;
      }
    }
    return count;
  };

  // Get color intensity based on completion count
  const getColorClass = (dateKey: string): string => {
    const count = getCompletionCount(dateKey);
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (totalHabits === 0) return 'bg-gray-100 dark:bg-gray-800';
    
    const percentage = (count / totalHabits) * 100;
    
    if (percentage === 100) return 'bg-green-600 dark:bg-green-500';
    if (percentage >= 75) return 'bg-green-500 dark:bg-green-400';
    if (percentage >= 50) return 'bg-green-400 dark:bg-green-300';
    if (percentage >= 25) return 'bg-green-300 dark:bg-green-200';
    return 'bg-green-200 dark:bg-green-100';
  };

  // Handle mouse hover for tooltip
  const handleMouseEnter = (dateKey: string, e: React.MouseEvent<HTMLDivElement>) => {
    setHoveredDate(dateKey);
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
  };

  const handleMouseLeave = () => {
    setHoveredDate(null);
  };

  // Get habits completed on a specific date
  const getCompletedHabits = (dateKey: string): string[] => {
    const completed: string[] = [];
    for (const habit of activeHabits) {
      if (logs[habit.id]?.[dateKey]) {
        completed.push(habit.name);
      }
    }
    return completed;
  };

  // Weekday labels
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="relative">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-600 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {gridDates.map(date => {
          const dateKey = toDateKey(date);
          const inCurrentMonth = isInMonth(dateKey, year, month);
          const completionCount = getCompletionCount(dateKey);
          const dayNumber = date.getDate();

          return (
            <div
              key={dateKey}
              className={`
                relative aspect-square rounded-md cursor-pointer transition-all duration-200
                ${getColorClass(dateKey)}
                ${inCurrentMonth ? '' : 'opacity-30'}
                ${hoveredDate === dateKey ? 'ring-2 ring-blue-500 scale-105' : ''}
              `}
              onMouseEnter={(e) => handleMouseEnter(dateKey, e)}
              onMouseLeave={handleMouseLeave}
              aria-label={`${format(date, 'MMM d, yyyy')} - ${completionCount} habit${completionCount !== 1 ? 's' : ''} completed`}
            >
              {/* Day number */}
              <div className={`
                absolute inset-0 flex items-center justify-center text-xs font-medium
                ${completionCount > 0 ? 'text-white' : 'text-gray-700 dark:text-gray-300'}
              `}>
                {dayNumber}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      {hoveredDate && (
        <div
          className="fixed z-50 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
          }}
        >
          <div className="font-semibold mb-1">
            {format(new Date(hoveredDate), 'MMM d, yyyy')}
          </div>
          <div className="text-xs">
            {getCompletionCount(hoveredDate)} / {totalHabits} habits completed
          </div>
          {getCompletedHabits(hoveredDate).length > 0 && (
            <div className="mt-1 text-xs text-gray-300 dark:text-gray-400">
              {getCompletedHabits(hoveredDate).join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-800" />
          <div className="w-4 h-4 rounded bg-green-200 dark:bg-green-100" />
          <div className="w-4 h-4 rounded bg-green-300 dark:bg-green-200" />
          <div className="w-4 h-4 rounded bg-green-400 dark:bg-green-300" />
          <div className="w-4 h-4 rounded bg-green-500 dark:bg-green-400" />
          <div className="w-4 h-4 rounded bg-green-600 dark:bg-green-500" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default HeatmapMonth;
