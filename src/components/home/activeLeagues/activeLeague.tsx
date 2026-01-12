import Link from 'next/link';
import { SquareArrowOutUpRight } from 'lucide-react';
import Scoreboard from '~/components/leagues/hub/scoreboard/view';
import { DraftCountdown } from '~/components/leagues/predraft/countdown/view';
import { type League } from '~/types/leagues';
import DraftOrder from '~/components/leagues/predraft/order/view';

interface ActiveLeagueProps {
  league: League;
}

export default function ActiveLeague({ league }: ActiveLeagueProps) {
  return (
    <div className='space-y-6 px-8'>
      <Link
        key={league.hash}
        href={`/leagues/${league.hash}`}
        className='group block'>
        <div className='text-left flex items-baseline justify-between gap-4 mt-1 border-b border-border/40'>
          <div className='space-y-1'>
            <h3 className='text-2xl md:text-3xl leading-none font-light tracking-wide group-hover:opacity-70 transition-opacity'>
              {league.name}
            </h3>
            <p className='text-sm text-muted-foreground leading-none font-light ml-0.5'>
              {league.season}
            </p>
          </div>
          <SquareArrowOutUpRight
            size={18}
            className='stroke-muted-foreground opacity-0 group-hover:opacity-100 group-active:opacity-75 transition-all shrink-0 hover:stroke-primary active:stroke-secondary' />
        </div>
      </Link>
      {league.status === 'Active'
        ? <Scoreboard overrideHash={league.hash} maxRows={5} className='bg-transparent' />
        : <div className='space-y-4'>
          <DraftCountdown overrideHash={league.hash} />
          <DraftOrder overrideHash={league.hash} className='bg-secondary/75 mb-3' scrollHeight='max-h-36 h-36' />
        </div>
      }
    </div>
  );
}

