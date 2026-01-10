import Link from 'next/link';
import { FlameKindling } from 'lucide-react';
import { type CurrentSelection, type LeagueMember } from '~/types/leagueMembers';
import { type League } from '~/types/leagues';
import ColorRow from '~/components/shared/colorRow';
import { cn } from '~/lib/utils';
import RecreateLeague from '~/components/leagues/actions/league/create/recreate';

interface LeagueCardProps {
  league: League;
  member: LeagueMember;
  currentSelection: CurrentSelection;
  refresh?: boolean;
  className?: string;
}

export default function LeagueCard({ league, member, currentSelection, refresh, className }: LeagueCardProps) {
  return (
    <Link
      key={league.hash}
      href={`/leagues/${league.hash}`}>
      <section className={cn(
        'px-2 py-2 h-full flex-col flex rounded-lg bg-card hover:bg-card/80 hover:shadow-lg transition-all',
        className
      )}>
        <h3 className='text-xl font-semibold'>{league.name}</h3>
        <p className='text-sm mt-auto'>{league.season}</p>
        {currentSelection ? (
          <p>
            <i>{currentSelection.fullName}</i>
            {currentSelection.isEliminated && <FlameKindling className='inline' size={16} />}
          </p>
        ) : (
          <p><i>Yet to draft</i></p>
        )}
        <ColorRow className='justify-center' color={member.color}>
          {member.displayName}
        </ColorRow>
        {refresh && <RecreateLeague hash={league.hash} />}
      </section>
    </Link >
  );
}
