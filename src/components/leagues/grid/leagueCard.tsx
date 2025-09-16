import Link from 'next/link';
import { FlameKindling } from 'lucide-react';
import { type CurrentSelection, type LeagueMember } from '~/types/leagueMembers';
import { type League } from '~/types/leagues';
import ColorRow from '~/components/shared/colorRow';

interface LeagueCardProps {
  league: League;
  member: LeagueMember;
  currentSelection: CurrentSelection;
}

export default function LeagueCard({ league, member, currentSelection }: LeagueCardProps) {
  return (
    <Link
      key={league.hash}
      href={`/leagues/${league.hash}`}>
      <section className='px-2 py-1 h-full flex-col flex rounded-lg bg-card hover:bg-card/80 hover:shadow-lg transition-all'>
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
      </section>
    </Link>
  );
}
