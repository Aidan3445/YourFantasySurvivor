import { type LeagueInfo } from '~/context/yfsUserContext';
import Link from 'next/link';
import { Badge } from '~/components/common/badge';
import { Eye } from 'lucide-react';
import Scoreboard from '~/components/leagues/hub/scoreboard';
import { DraftCountdown } from '~/components/leagues/predraft/draftCountdown';

interface ActiveLeagueProps {
  league: LeagueInfo;
}

export default function ActiveLeague({ league }: ActiveLeagueProps) {
  return (
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
  );
}

