import { useState, useEffect, useCallback } from 'react';

const DISMISS_STORAGE_KEY = 'floating-actions-dismissed-until';
const DISMISS_DURATION_MS = 5 * 60 * 1000;
const DISMISS_EVENT = 'floating-actions-dismissed';

export function useFloatingActionWidget() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkVisibility = () => {
      const dismissedUntil = localStorage.getItem(DISMISS_STORAGE_KEY);
      if (dismissedUntil) {
        const dismissedUntilTime = parseInt(dismissedUntil, 10);
        if (Date.now() < dismissedUntilTime) {
          setIsVisible(false);
          return;
        }
        localStorage.removeItem(DISMISS_STORAGE_KEY);
      }
      setIsVisible(true);
    };

    checkVisibility();

    // Sync across hook instances when dismissed
    const handleDismiss = () => setIsVisible(false);
    window.addEventListener(DISMISS_EVENT, handleDismiss);

    return () => {
      window.removeEventListener(DISMISS_EVENT, handleDismiss);
    };
  }, []);

  const dismiss = useCallback(() => {
    const dismissUntil = Date.now() + DISMISS_DURATION_MS;
    localStorage.setItem(DISMISS_STORAGE_KEY, dismissUntil.toString());
    setIsVisible(false);
    window.dispatchEvent(new Event(DISMISS_EVENT));
  }, []);

  return { isVisible, dismiss };
}
