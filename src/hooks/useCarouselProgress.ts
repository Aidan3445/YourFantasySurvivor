import { useEffect, useMemo, useState } from 'react';
import { type CarouselApi } from '~/components/ui/carousel';

export function useCarouselProgress(startAtZero?: boolean) {
  const [api, setApi] = useState<CarouselApi>();
  const [count, setCount] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const progress = useMemo(() => {
    if (count === 0) return 0;
    return (current + (startAtZero ? 0 : 1)) / count * 100;
  }, [current, count, startAtZero]);


  return { api, setApi, current, count, progress };
}
