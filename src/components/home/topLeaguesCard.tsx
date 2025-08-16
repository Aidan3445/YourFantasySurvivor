'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Trophy, Users, Calendar, FlameKindling } from 'lucide-react';
import { useYfsUser } from '~/hooks/useYfsUser';

export function TopLeaguesCard() {
  const { leagues } = useYfsUser();

  // Get top 3 most recently active leagues or all if fewer than 3
  const topLeagues = leagues
    .filter(league => league.leagueStatus !== 'Inactive')
    .slice(0, 3);

  if (topLeagues.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Trophy className='w-5 h-5 text-yellow-500' />
            Your Leagues
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
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='flex items-center gap-2'>
          <Trophy className='w-5 h-5 text-yellow-500' />
          Your Top Leagues
        </CardTitle>
        <Button variant='outline' size='sm' asChild>
          <Link href='/leagues'>View All</Link>
        </Button>
      </CardHeader>
      <CardContent className='space-y-3'>
        {topLeagues.map((league) => (
          <Link
            key={league.leagueHash}
            href={`/leagues/${league.leagueHash}`}
            className='block'
          >
            <div className='p-3 rounded-lg border hover:bg-accent/50 transition-colors'>
              <div className='flex items-center justify-between mb-2'>
                <h4 className='font-semibold'>{league.leagueName}</h4>
                <Badge variant='secondary'>{league.season}</Badge>
              </div>
              <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                <div className='flex items-center gap-1'>
                  <Users className='w-4 h-4' />
                  <span>League</span>
                </div>
                {league.castaway ? (
                  <div className='flex items-center gap-1'>
                    {league.out ? (
                      <FlameKindling className='w-4 h-4 text-red-500' />
                    ) : (
                      <Calendar className='w-4 h-4' />
                    )}
                    <span className={league.out ? 'text-red-500' : ''}>
                      {league.castaway}
                      {league.out ? ' (eliminated)' : ''}
                    </span>
                  </div>
                ) : (
                  <span className='text-muted-foreground'>Yet to draft</span>
                )}
              </div>
            </div>
          </Link>
        ))}
        {leagues.length > 3 && (
          <div className='text-center pt-2'>
            <Button variant='ghost' size='sm' asChild>
              <Link href='/leagues'>
                View {leagues.length - 3} more leagues
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
