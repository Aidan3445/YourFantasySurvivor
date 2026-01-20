'use client';

import { Card, CardContent, CardHeader } from '~/components/common/card';
import LeagueCard from '~/components/leagues/grid/leagueCard';
import { useSeasons } from '~/hooks/seasons/useSeasons';
import { type CurrentSelection, type LeagueMember } from '~/types/leagueMembers';
import { type League } from '~/types/leagues';

interface LeagueGridProps {
  leagues: { league: League; member: LeagueMember; currentSelection: CurrentSelection }[];
  isInactive?: boolean;
}

export default function LeagueGrid({ leagues, isInactive = false }: LeagueGridProps) {
  const { data: seasons } = useSeasons(isInactive);

  if (leagues.length === 0) return null;

  const leaguesBySeason = Object.values(leagues.reduce((acc, leagueItem) => {
    const seasonId = leagueItem.league.seasonId;
    acc[seasonId] ??= [];
    acc[seasonId].push(leagueItem);
    return acc;
  }, {} as Record<number, typeof leagues>))
    .sort((a, b) => {
      const seasonA = seasons?.find(s => s.seasonId === a[0]!.league.seasonId);
      const seasonB = seasons?.find(s => s.seasonId === b[0]!.league.seasonId);
      if (!seasonA || !seasonB) return 0;
      return new Date(seasonB.premiereDate).getTime() - new Date(seasonA.premiereDate).getTime();
    });

  if (isInactive) {
    return (
      <section className='space-y-6'>
        {leaguesBySeason
          .map(seasonLeagues => {
            const season = seasons?.find(s => s.seasonId === seasonLeagues[0]!.league.seasonId);
            if (!season) return null;
            return (
              <Card key={season.seasonId} className='relative overflow-hidden transition-opacity border-2 border-primary/20'>
                <CardHeader className='flex items-center justify-start gap-4 mb-4 relative z-10'>
                  <div className='h-6 w-1 bg-secondary rounded-full' />
                  <h2 className='text-xl font-black text-muted-foreground uppercase tracking-tight leading-none'>
                    {season.name}
                  </h2>
                </CardHeader>
                <CardContent className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative z-10'>
                  {seasonLeagues.map(({ league, member, currentSelection }) => (
                    <LeagueCard
                      key={league.hash}
                      league={league}
                      member={member}
                      currentSelection={currentSelection}
                      refresh={isInactive} />
                  ))}
                </CardContent>
              </Card>
            );
          })}
      </section>
    );
  }

  return (
    <Card className='relative overflow-hidden transition-opacity border-2 border-primary/20'>
      <CardHeader className='flex items-center justify-start gap-4 mb-4 relative z-10'>
        <div className='h-6 w-1 bg-primary rounded-full' />
        <h2 className='text-xl font-black uppercase tracking-tight leading-none'>
          {leagues[0]!.league.season}
        </h2>
      </CardHeader>
      <CardContent className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative z-10'>
        {leagues.map((leagueItem) => (
          <LeagueCard key={leagueItem.league.hash} {...leagueItem} />
        ))}
      </CardContent>
    </Card>
  );
}
