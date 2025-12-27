import { type FC } from 'react';
import { type Badge, type BadgeType } from '../store/types';
import { BADGE_DEFINITIONS } from '../utils/badgeUtils';

interface BadgeGalleryProps {
  unlockedBadges: Badge[];
}

/**
 * Badge Gallery component - displays locked and unlocked badges
 * Shows achievements/badges users have earned and those still to unlock
 */
const BadgeGallery: FC<BadgeGalleryProps> = ({ unlockedBadges }) => {
  const unlockedTypes = new Set(unlockedBadges.map((b) => b.type));
  
  // Get all badge types in a specific order
  const allBadgeTypes: BadgeType[] = [
    'first_habit',
    'first_checkin',
    'perfect_day',
    'streak_3',
    'streak_7',
    'streak_30',
    'streak_100',
    'perfect_week',
    'perfect_month',
    'early_bird',
    'night_owl',
    'consistency_king',
    'habit_master',
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Achievements
        </h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {unlockedBadges.length} / {allBadgeTypes.length} unlocked
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {allBadgeTypes.map((badgeType) => {
          const isUnlocked = unlockedTypes.has(badgeType);
          const badgeInfo = BADGE_DEFINITIONS[badgeType];
          const unlockedBadge = unlockedBadges.find((b) => b.type === badgeType);

          return (
            <div
              key={badgeType}
              className={`
                relative rounded-lg border-2 p-4 text-center transition-all
                ${
                  isUnlocked
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800 opacity-60'
                }
                hover:scale-105
              `}
              title={badgeInfo.description}
            >
              {/* Badge Icon */}
              <div className={`text-4xl mb-2 ${isUnlocked ? '' : 'grayscale'}`}>
                {badgeInfo.icon}
              </div>

              {/* Badge Name */}
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {badgeInfo.name}
              </div>

              {/* Badge Description */}
              <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {badgeInfo.description}
              </div>

              {/* Unlocked Date */}
              {isUnlocked && unlockedBadge && (
                <div className="absolute top-1 right-1">
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs bg-green-500 text-white rounded-full">
                    ✓
                  </span>
                </div>
              )}

              {/* Locked Indicator */}
              {!isUnlocked && (
                <div className="absolute top-1 right-1">
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs bg-gray-400 text-white rounded-full">
                    🔒
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgeGallery;
