'use client';

import Chart from '~/components/leagues/hub/chart/view';
import Scoreboard from '~/components/leagues/hub/scoreboard/view';
import Podium from '~/components/leagues/hub/scoreboard/podium/view';
import { Carousel, CarouselContent, CarouselItem } from '~/components/common/carousel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/common/tabs';
import { useTabsCarousel } from '~/hooks/ui/useTabsCarousel';

interface ScoresProps {
  isActive?: boolean;
}

export default function Scores({ isActive = false }: ScoresProps) {
  const scoreTabs = ['podium', 'scoreboard', 'chart'] as const;
  type ScoreTab = typeof scoreTabs[number];

  const { setApi, activeTab, setActiveTab } = useTabsCarousel<ScoreTab>({
    tabs: isActive ? ['scoreboard', 'chart'] : [...scoreTabs],
    defaultTab: isActive ? 'scoreboard' : 'podium',
  });

  return (
    <div className='w-full bg-card rounded-xl'>
      <Tabs
        className='w-full'
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as ScoreTab)}>
        <TabsList className='bg-accent grid grid-flow-col auto-cols-fr mx-2 z-50 m-2 border-none'>
          {!isActive && <TabsTrigger value='podium'>Podium</TabsTrigger>}
          <TabsTrigger value='scoreboard'>Scoreboard</TabsTrigger>
          <TabsTrigger value='chart'>Chart</TabsTrigger>
        </TabsList>
        <Carousel className='w-full' setApi={setApi}>
          <CarouselContent>
            {!isActive && (
              <CarouselItem>
                <TabsContent value='podium' forceMount className='h-11/12'>
                  <Podium />
                </TabsContent>
              </CarouselItem>
            )}
            <CarouselItem>
              <TabsContent value='scoreboard' forceMount>
                <Scoreboard />
              </TabsContent>
            </CarouselItem>
            <CarouselItem>
              <TabsContent value='chart' forceMount>
                <Chart />
              </TabsContent>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </Tabs>
    </div>
  );
}
