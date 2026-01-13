import Link from 'next/link';
import { FlameKindling, ChevronRight } from 'lucide-react';
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
      href={`/leagues/${league.hash}`}
      className='group'>
      <section className={cn(
        'px-3 py-3 h-full flex-col flex rounded-lg bg-primary/5 border-2 border-primary/20 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all relative',
        className
      )}>
        <div className='flex items-start justify-between gap-2'>
          <h3 className='text-lg font-bold leading-tight'>{league.name}</h3>
          <ChevronRight className='w-5 h-5 shrink-0 text-primary opacity-0 group-hover:opacity-100 transition-opacity' />
        </div>

        <div className='mt-auto space-y-2'>
          {currentSelection ? (
            <div className='flex items-center gap-1 text-sm'>
              <span className='font-bold text-muted-foreground'>Draft:</span>
              <span className='italic'>{currentSelection.fullName}</span>
              {currentSelection.isEliminated && <FlameKindling className='inline w-4 h-4 shrink-0 text-destructive' />}
            </div>
          ) : (
            <p className='text-sm'>
              <span className='font-bold text-muted-foreground'>Draft:</span> <span className='italic'>Yet to draft</span>
            </p>
          )}
          <ColorRow className='justify-center font-bold border-2' color={member.color}>
            {member.displayName}
          </ColorRow>
        </div>
        {refresh && <RecreateLeague hash={league.hash} />}
      </section>
    </Link>
  );
}
