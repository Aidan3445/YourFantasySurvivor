import Link from 'next/link';
import { FlameKindling } from 'lucide-react';
import { type LeagueInfo } from '~/context/yfsUserContext';

interface LeagueCardProps {
  league: LeagueInfo;
}

export function LeagueCard({ league }: LeagueCardProps) {
  return (
    <Link
      key={league.leagueHash}
      href={`/leagues/${league.leagueHash}`}>
      <section className='px-2 py-1 rounded-lg bg-card hover:bg-card/80 hover:shadow-lg transition-all'>
        <h3 className='text-xl font-semibold'>{league.leagueName}</h3>
        <p className='text-sm'>{league.season}</p>
        {league.castaway ? (
          <p>
            <i>{league.castaway}</i>
            {league.out && <FlameKindling className='inline' size={16} />}
          </p>
        ) : (
          <p><i>Yet to draft</i></p>
        )}
      </section>
    </Link>
  );
}