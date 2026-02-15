import { useState, useEffect, useCallback } from 'react';

const DISMISS_STORAGE_KEY = 'floating-actions-dismissed-until';
const DISMISS_DURATION_MS = 5 * 60 * 1000;
const DISMISS_EVENT = 'floating-actions-dismissed';

export function useFloatingActionWidget() {
  const [isVisible, setIsVisible] = useState(false);

  const isLocalStorageAvailable = typeof window !== 'undefined' && (() => {
    try {
      window.localStorage.getItem('__test');
      return true;
    } catch {
      return false;
    }
  })();

  useEffect(() => {
    if (!isLocalStorageAvailable) {
      setIsVisible(false);
      return;
    }

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
  }, [isLocalStorageAvailable]);

  const dismiss = useCallback(() => {
    if (!isLocalStorageAvailable) return;

    const dismissUntil = Date.now() + DISMISS_DURATION_MS;
    localStorage.setItem(DISMISS_STORAGE_KEY, dismissUntil.toString());
    setIsVisible(false);
    window.dispatchEvent(new Event(DISMISS_EVENT));
  }, [isLocalStorageAvailable]);

  return { isVisible, dismiss };
}
