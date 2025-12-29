'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~/components/common/card';
import { Button } from '~/components/common/button';
import { Trophy } from 'lucide-react';
import {
  Carousel, type CarouselApi, CarouselContent, CarouselItem,
  CarouselNext, CarouselPrevious, CarouselProgress
} from '~/components/common/carousel';
import { cn } from '~/lib/utils';
import Autoplay from 'embla-carousel-autoplay';
import NoActiveLeagues from '~/components/home/activeLeagues/noActiveLeagues';
import ActiveLeague from '~/components/home/activeLeagues/activeLeague';
import { useLeagues } from '~/hooks/user/useLeagues';
import { useEffect, useRef, useState } from 'react';
import { useIsFetching } from '@tanstack/react-query';
import LoadingLeagues from '~/components/home/activeLeagues/loadingLeagues';
import { type LeagueDetails } from '~/types/leagues';

export function ActiveLeagues() {
  const { data: leagues } = useLeagues();
  const isFetching = useIsFetching();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isFetching === 0 && !hasLoadedOnce) {
      timeoutRef.current = setTimeout(() => {
        setHasLoadedOnce(true);
        // After fade animation completes, hide the loading screen
        setTimeout(() => {
          setShowLoadingScreen(false);
        }, 400);
      }, 50);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isFetching, hasLoadedOnce]);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const topLeagues: LeagueDetails[] = [];
  const inactiveLeagues: LeagueDetails[] = [];

  leagues?.forEach(leagueDetails => leagueDetails.league.status !== 'Inactive'
    ? topLeagues.push(leagueDetails)
    : inactiveLeagues.push(leagueDetails)
  );
  topLeagues.sort((a, b) => {
    const statusOrder = { Draft: 0, Predraft: 1, Active: 2, Inactive: 3 };
    if (a.league.status !== b.league.status) {
      return statusOrder[a.league.status] - statusOrder[b.league.status];
    }
    return b.league.season.localeCompare(a.league.season);
  });

  const showLoading = !hasLoadedOnce;

  return (
    <div className={cn(
      'relative transition-all h-full',
      showLoadingScreen && 'h-72 lg:h-full overflow-hidden'
    )}>
      {showLoadingScreen && (
        <div className={cn('transition-opacity duration-400', !showLoading && 'opacity-0')}>
          <LoadingLeagues />
        </div>
      )}
      {(!topLeagues || topLeagues.length === 0)
        ? <NoActiveLeagues inactiveLeagues={inactiveLeagues} />
        : (
          <Card className={cn('h-full transition-opacity', showLoading && 'opacity-0')}>
            <CardContent className='px-0 overflow-y-auto'>
              <Carousel
                opts={{
                  loop: true,
                  watchDrag: topLeagues.length > 1,
                  ignoreKeys: topLeagues.length > 1
                }}
                plugins={[Autoplay({ delay: 8000, stopOnMouseEnter: true })]}
                setApi={setApi}>
                <CardHeader className='grid grid-cols-[min-content_1fr_auto_1fr_min-content] items-center px-4 mb-4'>
                  <div className='w-full invisible' />
                  <CarouselPrevious className={cn('static translate-0! place-self-center',
                    (topLeagues.length + inactiveLeagues.length) > 1 ? 'visible' : 'invisible')} />
                  <CardTitle className='flex items-center gap-2 place-self-center text-nowrap'>
                    <Trophy className='w-5 h-5 text-yellow-500' />
                    Current Leagues
                  </CardTitle>
                  <CarouselNext className={cn('static translate-0! place-self-center',
                    (topLeagues.length + inactiveLeagues.length) > 1 ? 'visible' : 'invisible')} />
                  <Button variant='outline' size='sm' asChild>
                    <Link href='/leagues' className='place-self-center'>
                      View all leagues
                    </Link>
                  </Button>
                </CardHeader>
                <CarouselContent>
                  {topLeagues.map(({ league }) => (
                    <CarouselItem key={league.hash}>
                      <ActiveLeague league={league} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
              <CardFooter>
                <CarouselProgress current={current} count={topLeagues.length} />
              </CardFooter>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
