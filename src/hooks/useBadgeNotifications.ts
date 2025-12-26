// Hook to show toast notifications when badges are unlocked
import { useEffect, useRef } from 'react';
import { useToast } from '../components/ToastContext';
import { type Badge } from '../store/types';

/**
 * Hook that monitors badge changes and shows toast notifications for new unlocks
 */
export const useBadgeNotifications = (unlockedBadges: Badge[]): void => {
  const { showToast } = useToast();
  const previousBadgeCountRef = useRef(unlockedBadges.length);

  useEffect(() => {
    const currentCount = unlockedBadges.length;
    const previousCount = previousBadgeCountRef.current;

    // Check if new badges were unlocked
    if (currentCount > previousCount) {
      const newBadges = unlockedBadges.slice(previousCount);
      
      // Show toast for each newly unlocked badge
      newBadges.forEach((badge, index) => {
        // Stagger multiple toasts slightly
        setTimeout(() => {
          showToast(
            `🎉 ${badge.name} unlocked!`,
            {
              type: 'success',
              icon: badge.icon,
              duration: 5000,
            }
          );
        }, index * 300);
      });
    }

    // Update ref for next check
    previousBadgeCountRef.current = currentCount;
  }, [unlockedBadges, showToast]);
};
