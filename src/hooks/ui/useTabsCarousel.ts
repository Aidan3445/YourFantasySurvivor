import { useState, useEffect, useCallback } from 'react';
import { type CarouselApi } from '~/components/common/carousel';

type UseTabsCarouselOptions<T extends string> = {
  tabs: [T, ...T[]];
  defaultTab?: T;
};

export function useTabsCarousel<T extends string>({
  tabs,
  defaultTab,
}: UseTabsCarouselOptions<T>) {
  const [api, setApi] = useState<CarouselApi>();
  const [activeTab, setActiveTab] = useState<T>(defaultTab ?? tabs[0]);

  // Sync carousel to tab changes
  const handleTabChange = useCallback(
    (tab: T) => {
      setActiveTab(tab);
      const index = tabs.indexOf(tab);
      if (api && index !== -1) {
        api.scrollTo(index);
      }
    },
    [api, tabs]
  );

  // Sync tab to carousel scroll
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      const index = api.selectedScrollSnap();
      const tab = tabs[index];
      if (tab && tab !== activeTab) {
        setActiveTab(tab);
      }
    };

    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api, tabs, activeTab]);

  return {
    api,
    setApi,
    activeTab,
    setActiveTab: handleTabChange,
  };
}
