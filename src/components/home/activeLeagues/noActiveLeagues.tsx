'use client';

import { Card, CardContent, CardHeader } from '~/components/common/card';
import { Trophy } from 'lucide-react';
import { type LeagueDetails } from '~/types/leagues';
import LeagueCard from '~/components/leagues/grid/leagueCard';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '~/components/common/carousel';
import { useIsMobile } from '~/hooks/ui/useMobile';
import { Button } from '~/components/common/button';
import Link from 'next/link';
import { Separator } from '~/components/common/separator';

interface NoActiveLeaguesProps {
  inactiveLeagues: LeagueDetails[];
}

export default function NoActiveLeagues({ inactiveLeagues }: NoActiveLeaguesProps) {
  const isMobile = useIsMobile();

  return (
    <Card className='relative overflow-hidden transition-opacity border-2 border-primary/20'>
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

      <CardContent className='px-0 mb-8 max-w-[calc(100vw-2rem)] md:max-w-[calc(100vw-3.35rem-var(--sidebar-width))]'>
        {inactiveLeagues.length === 0 ? (
          <div className='text-center py-12'>
            <div className='inline-flex p-6 bg-primary/10 rounded-2xl mb-6'>
              <Trophy className='w-16 h-16 text-primary' />
            </div>
            <p className='text-lg font-medium max-w-md mx-auto'>
              You don&apos;t have any leagues yet. Create or join one to start competing!
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
                }}>
                <CarouselContent className='ml-0'>
                  {[...inactiveLeagues, ...inactiveLeagues]
                    .sort((a, b) => b.league.season.localeCompare(a.league.season))
                    .map((leagueDetails, index) => (
                      <CarouselItem
                        key={leagueDetails.league.hash + `-${index}`}
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
                    <CarouselPrevious className='absolute left-10 -bottom-14 top-auto' />
                    <CarouselNext className='absolute right-10 -bottom-14 top-auto' />
                  </div>
                )}
              </Carousel>
            </div>
          </div>
        )}
      </CardContent>
    </Card >
  );
}
