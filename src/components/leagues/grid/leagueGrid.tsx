import { Fragment } from 'react';
import LeagueCard from '~/components/leagues/grid/leagueCard';
import { type CurrentSelection, type LeagueMember } from '~/types/leagueMembers';
import { type League } from '~/types/leagues';

interface LeagueGridProps {
  leagues: { league: League; member: LeagueMember; currentSelection: CurrentSelection }[];
  isInactive?: boolean;
}

export default function LeagueGrid({ leagues, isInactive = false }: LeagueGridProps) {
  if (leagues.length === 0) return null;

  if (isInactive) {
    return (
      <section className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-12 w-5/6'>
        {leagues
          .toSorted(({ league: a }, { league: b }) => b.season.localeCompare(a.season))
          .map(({ league, member, currentSelection }, index) => (
            <Fragment key={index}>
              {/* Display season header only once for each season */}
              {leagues.findIndex(({ league: l }) => l.seasonId === league.seasonId) === index && (
                <h3
                  key={league.season}
                  className='md:col-span-2 lg:col-span-4 -mb-2 text-center text-lg text-primary-foreground font-semibold bg-primary rounded-full'>
                  {league.season}
                </h3>
              )}
              <LeagueCard league={league} member={member} currentSelection={currentSelection} />
            </Fragment>
          ))
        }
      </section>
    );
  }

  return (
    <section className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-12 w-5/6'>
      {leagues.map((leagueItem) => (
        <LeagueCard key={leagueItem.league.hash} {...leagueItem} />
      ))}
    </section>
  );
}
