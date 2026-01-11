import { useEffect } from 'react';

export function useHorizontalResize(ref: React.RefObject<HTMLElement>, onResize: () => void) {
  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(onResize);

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, onResize]);
}
