'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/common/card';
import { Button } from '~/components/common/button';
import { Trophy } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '~/components/common/carousel';
import { cn } from '~/lib/utils';
import Autoplay from 'embla-carousel-autoplay';
import NoActiveLeagues from '~/components/home/activeLeagues/noActiveLeagues';
import ActiveLeague from '~/components/home/activeLeagues/activeLeague';
import { useLeagues } from '~/hooks/user/useLeagues';

export function ActiveLeagues() {
  const { data: leagues } = useLeagues();

  const topLeagues = leagues?.filter(({ league }) => league.status !== 'Inactive')
    .sort((a, b) => {
      const statusOrder = { Draft: 0, Predraft: 1, Active: 2, Inactive: 3 };
      if (a.league.status !== b.league.status) {
        return statusOrder[a.league.status] - statusOrder[b.league.status];
      }
      return b.league.season.localeCompare(a.league.season);
    });

  if (!topLeagues || topLeagues.length === 0) {
    return <NoActiveLeagues />;
  }

  return (
    <Card className='h-full'>
      <CardContent className='px-0 overflow-y-auto'>
        <Carousel
          opts={{
            loop: true,
            watchDrag: topLeagues.length > 1,
            ignoreKeys: topLeagues.length > 1
          }}
          plugins={[Autoplay({ delay: 8000, stopOnInteraction: true })]}
        >
          <CardHeader className='grid grid-cols-[min-content_1fr_auto_1fr_min-content] items-center px-4 mb-4'>
            <div className='w-full invisible' />
            <CarouselPrevious className={cn('static !translate-0 place-self-center',
              topLeagues.length > 1 ? 'visible' : 'invisible')} />
            <CardTitle className='flex items-center gap-2 place-self-center text-nowrap'>
              <Trophy className='w-5 h-5 text-yellow-500' />
              Current Leagues
            </CardTitle>
            <CarouselNext className={cn('static !translate-0 place-self-center',
              topLeagues.length > 1 ? 'visible' : 'invisible')} />
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
      </CardContent>
    </Card>
  );
}
