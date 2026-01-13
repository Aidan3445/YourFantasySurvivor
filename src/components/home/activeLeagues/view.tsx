'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '~/components/common/card';
import { Button } from '~/components/common/button';
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
import { Separator } from '~/components/common/separator';

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
      'relative transition-all',
      showLoadingScreen && 'h-96 overflow-hidden'
    )}>
      {showLoadingScreen ? (
        <div className={cn('transition-opacity duration-400', !showLoading && 'opacity-0')}>
          <LoadingLeagues />
        </div>
      ) : (
        <>
          {(!topLeagues || topLeagues.length === 0)
            ? <NoActiveLeagues inactiveLeagues={inactiveLeagues} />
            : (
              <Card className={cn('relative overflow-hidden transition-opacity border-2 border-primary/20', showLoading && 'opacity-0')}>
                {/* Accent Glow */}
                <div className='absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl' />

                <CardHeader className='relative z-10'>
                  {/* Section Header */}
                  <div className='flex items-end justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='h-6 md:h-8 w-1 bg-primary rounded-full' />
                      <h2 className='text-xl md:text-4xl font-black tracking-tight uppercase'>
                        Your Leagues
                      </h2>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      asChild
                      className='border-primary/30 hover:bg-primary/10 hover:border-primary/50 font-bold uppercase text-xs tracking-wider'>
                      <Link href='/leagues'>
                        View All
                      </Link>
                    </Button>
                  </div>
                  <Separator className='bg-primary/20' />
                </CardHeader>

                <CardContent className='px-0 mb-8 max-w-[calc(100vw-2rem)] md:max-w-[calc(100vw-3rem-var(--sidebar-width))]'>
                  <Carousel
                    opts={{
                      loop: true,
                      watchDrag: topLeagues.length > 1,
                      ignoreKeys: topLeagues.length > 1
                    }}
                    plugins={[Autoplay({
                      delay: 8000,
                      stopOnMouseEnter: true,
                      stopOnInteraction: true,
                      stopOnFocusIn: true,
                      stopOnLastSnap: true
                    })]}
                    setApi={setApi}>
                    <CarouselContent className={cn('p-0', topLeagues.length > 1 && 'cursor-ew-resize')}>
                      {topLeagues.map(({ league }) => (
                        <CarouselItem key={league.hash}>
                          <ActiveLeague league={league} />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {(topLeagues.length + inactiveLeagues.length) > 1 && (
                      <>
                        <CarouselPrevious className='absolute left-10 -bottom-14 top-auto' />
                        <CarouselProgress className='rounded-none' current={current} count={topLeagues.length} />
                        <CarouselNext className='absolute right-10 -bottom-14 top-auto' />
                      </>
                    )}
                  </Carousel>
                </CardContent>
              </Card>
            )}
        </>
      )}
    </div>
  );
}
