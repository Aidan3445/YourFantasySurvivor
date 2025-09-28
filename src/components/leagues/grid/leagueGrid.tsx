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
      <section className='grid grid-cols-1 md:grid-cols-4 gap-x-5 w-5/6 mx-5 gap-y-5 md:gap-y-0 pb-12'>
        {leagues
          .toSorted(({ league: a }, { league: b }) => b.season.localeCompare(a.season))
          .map(({ league, member, currentSelection }, index) => (
            <Fragment key={index}>
              {/* Display season header only once for each season */}
              {leagues.findIndex(({ league: l }) => l.seasonId === league.seasonId) === index && (
                <h3
                  key={league.season}
                  className='md:col-span-4 mt-3 -mb-3 text-center text-lg text-primary-foreground font-semibold bg-primary rounded-full'>
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
    <section className='grid grid-cols-1 md:grid-cols-4 gap-5 w-5/6 mx-5'>
      {leagues.map((leagueItem) => (
        <LeagueCard key={leagueItem.league.hash} {...leagueItem} />
      ))}
    </section>
  );
}
