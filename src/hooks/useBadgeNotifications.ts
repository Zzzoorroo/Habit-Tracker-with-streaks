// Hook to show toast notifications when badges are unlocked
import { useEffect, useRef } from 'react';
import { useToast } from '../components/ToastContext';
import { type Badge } from '../store/types';

// Delay between multiple toast notifications (in milliseconds)
const TOAST_STAGGER_DELAY_MS = 300;

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
        }, index * TOAST_STAGGER_DELAY_MS);
      });
    }

    // Update ref for next check
    previousBadgeCountRef.current = currentCount;
  }, [unlockedBadges, showToast]);
};
