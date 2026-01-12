'use client';

import { Card, CardContent } from '~/components/common/card';
import { Trophy } from 'lucide-react';
import { type LeagueDetails } from '~/types/leagues';
import LeagueCard from '~/components/leagues/grid/leagueCard';
import { Carousel, type CarouselApi, CarouselContent, CarouselItem, CarouselProgress } from '~/components/common/carousel';
import { useEffect, useState } from 'react';
import { useIsMobile } from '~/hooks/ui/useMobile';

interface NoActiveLeaguesProps {
  inactiveLeagues: LeagueDetails[];
}

export default function NoActiveLeagues({ inactiveLeagues }: NoActiveLeaguesProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <Card className='bg-card border-border/50 shadow-sm'>
      <CardContent className='p-6 md:p-8'>
        <div className='space-y-8'>
          <h2 className='text-3xl md:text-4xl font-light tracking-tight'>
            Your Leagues
          </h2>

          {inactiveLeagues.length === 0 ? (
            <div className='text-center py-12'>
              <Trophy className='w-16 h-16 text-muted-foreground/30 mx-auto mb-6' />
              <p className='text-lg text-muted-foreground font-light max-w-md mx-auto'>
                You don&apos;t have any leagues yet. Create or join one to get started.
              </p>
            </div>
          ) : (
            <div className='space-y-8'>
              <div className='text-center py-8'>
                <p className='text-muted-foreground font-light'>
                  No active leagues at the moment
                </p>
              </div>
              <div>
                <h3 className='text-xl font-light mb-6 text-muted-foreground'>
                  Inactive Leagues
                </h3>
                <Carousel
                  opts={{
                    watchDrag: inactiveLeagues.length > 1,
                    ignoreKeys: inactiveLeagues.length > 1,
                    containScroll: isMobile ? false : 'trimSnaps',
                  }}
                  setApi={setApi}>
                  <CarouselContent className='ml-0'>
                    {inactiveLeagues
                      .sort((a, b) => b.league.season.localeCompare(a.league.season))
                      .map(leagueDetails => (
                        <CarouselItem
                          key={leagueDetails.league.hash}
                          className='xl:basis-1/3 lg:basis-1/2 md:basis-3/5 sm:basis-[80%] basis-[90%] p-2'>
                          <LeagueCard
                            league={leagueDetails.league}
                            member={leagueDetails.member}
                            currentSelection={leagueDetails.currentSelection}
                            refresh
                            className='bg-secondary/50 hover:bg-secondary/80'
                          />
                        </CarouselItem>
                      ))
                    }
                  </CarouselContent>
                  {inactiveLeagues.length > 1 && (
                    <div className='mt-6'>
                      <CarouselProgress
                        current={current == 1 ? 1 : current * 1.33}
                        count={inactiveLeagues.length} />
                    </div>
                  )}
                </Carousel>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
