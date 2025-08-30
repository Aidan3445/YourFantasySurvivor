'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../common/card';
import { Badge } from '../common/badge';
import { Button } from '../common/button';
import { Trophy, Eye } from 'lucide-react';
import { useYfsUser } from '~/hooks/useYfsUser';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../common/carousel';
import Scoreboard from '../leagues/main/scoreboard';
import { cn } from '~/lib/utils';
import { DraftCountdown } from '../leagues/draftCountdown';
import Autoplay from 'embla-carousel-autoplay';

export function TopLeaguesCard() {
  const { leagues } = useYfsUser();

  const topLeagues = leagues
    .filter(league => league.leagueStatus !== 'Inactive')
    .sort((a, b) => {
      const statusOrder = { Draft: 0, Predraft: 1, Active: 2, Inactive: 3 };
      if (a.leagueStatus !== b.leagueStatus) {
        return statusOrder[a.leagueStatus] - statusOrder[b.leagueStatus];
      }
      return b.season.localeCompare(a.season);
    });

  if (topLeagues.length === 0) {
    return (
      <Card className='h-full'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Trophy className='w-5 h-5 text-yellow-500' />
            Current Leagues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-6'>
            <Trophy className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
            <p className='text-muted-foreground mb-4'>
              No active leagues yet. Create one to get started!
            </p>
          </div>
        </CardContent>
      </Card>
    );
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
            {topLeagues.map((league) => (
              <CarouselItem key={league.leagueHash}>
                <div className='px-2 space-y-2'>
                  <Link
                    key={league.leagueHash}
                    href={`/leagues/${league.leagueHash}`}
                    className='block'>
                    <div className='px-2 py-1 rounded-lg border hover:bg-accent/50 transition-colors flex items-center justify-between mb-2'>
                      <h4 className='font-semibold mr-auto'>{league.leagueName}</h4>
                      <Badge variant='secondary'>{league.season}</Badge>
                      <Eye className='ml-2' />
                    </div>
                  </Link>
                  {league.leagueStatus === 'Active'
                    ? <Scoreboard overrideLeagueHash={league.leagueHash} maxRows={5} />
                    : <DraftCountdown overrideLeagueHash={league.leagueHash} />}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </CardContent>
    </Card>
  );
}
