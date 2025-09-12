import Link from 'next/link';
import { Badge } from '~/components/common/badge';
import { Eye } from 'lucide-react';
import Scoreboard from '~/components/leagues/hub/scoreboard/view';
import { DraftCountdown } from '~/components/leagues/predraft/countdown/view';
import { type League } from '~/types/leagues';
import DraftOrder from '~/components/leagues/predraft/order/view';

interface ActiveLeagueProps {
  league: League;
}

export default function ActiveLeague({ league }: ActiveLeagueProps) {
  return (
    <div className='px-2 space-y-2'>
      <Link
        key={league.hash}
        href={`/leagues/${league.hash}`}
        className='block'>
        <div className='px-2 py-1 rounded-lg border hover:bg-accent/50 transition-colors flex items-center justify-between mb-2'>
          <h4 className='font-semibold mr-auto'>{league.name}</h4>
          <Badge variant='secondary'>{league.season}</Badge>
          <Eye className='ml-2' />
        </div>
      </Link>
      {league.status === 'Active'
        ? <Scoreboard overrideHash={league.hash} maxRows={5} className='bg-accent' />
        : <div className='space-y-0'>
          <DraftCountdown overrideHash={league.hash} />
          <DraftOrder overrideHash={league.hash} className='bg-accent' />
        </div>}
    </div>
  );
}

