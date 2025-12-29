'use client';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/common/card';
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
    <Card className='h-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Trophy className='w-5 h-5 text-yellow-500' />
          Current Leagues
        </CardTitle>
      </CardHeader>
      <CardContent className='px-0'>
        {inactiveLeagues.length === 0 ? (
          <div className='text-center py-6'>
            <Trophy className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
            <p className='text-muted-foreground mb-4'>
              You don&apos;t have any leagues yet. Create or join one to get started!
            </p>
          </div>
        ) : (
          <div className='text-center py-6'>
            <Trophy className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
            <p className='text-muted-foreground mb-4'>
              You don&apos;t have any active leagues. Your inactive leagues are listed below:
            </p>
            <Carousel
              opts={{
                watchDrag: inactiveLeagues.length > 1,
                ignoreKeys: inactiveLeagues.length > 1,
                containScroll: isMobile ? false : 'trimSnaps',
              }}
              setApi={setApi}>
              <CarouselContent
                className='ml-0'>
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
                        className='bg-secondary hover:bg-secondary/80'
                      />
                    </CarouselItem>
                  ))
                }
              </CarouselContent>
            </Carousel>
          </div>
        )}
        <CarouselProgress
          current={current == 1 ? 1 : current * 1.33}
          count={inactiveLeagues.length} />
      </CardContent>
    </Card >
  );
}
