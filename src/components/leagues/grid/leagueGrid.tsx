import { Fragment } from 'react';
import { type LeagueInfo } from '~/context/yfsUserContext';
import { LeagueCard } from '~/components/leagues/grid/leagueCard';

interface LeagueGridProps {
  leagues: LeagueInfo[];
  isInactive?: boolean;
}

export function LeagueGrid({ leagues, isInactive = false }: LeagueGridProps) {
  if (leagues.length === 0) return null;

  if (isInactive) {
    return (
      <section className='grid grid-cols-4 gap-x-5 w-5/6 mx-5'>
        {leagues
          .toSorted((a, b) => b.season.localeCompare(a.season))
          .map((league, index) => (
            <Fragment key={index}>
              {/* Display season header only once for each season */}
              {leagues.findIndex(l => l.season === league.season) === index && (
                <h3
                  key={league.season}
                  className='col-span-4 mt-3 mb-2 text-center text-lg text-primary-foreground font-semibold bg-primary rounded-full'>
                  {league.season}
                </h3>
              )}
              <LeagueCard league={league} />
            </Fragment>
          ))
        }
      </section>
    );
  }

  return (
    <section className='grid grid-cols-4 gap-5 w-5/6 mx-5'>
      {leagues.map(league => (
        <LeagueCard key={league.leagueHash} league={league} />
      ))}
    </section>
  );
}