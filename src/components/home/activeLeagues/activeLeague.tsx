import Link from 'next/link';
import { SquareArrowOutUpRight, Trophy, Clock } from 'lucide-react';
import Scoreboard from '~/components/leagues/hub/scoreboard/view';
import { DraftCountdown } from '~/components/leagues/predraft/countdown/view';
import { type League } from '~/types/leagues';
import DraftOrder from '~/components/leagues/predraft/order/view';
import { Badge } from '~/components/common/badge';
import { cn } from '~/lib/utils';

interface ActiveLeagueProps {
  league: League;
}

export default function ActiveLeague({ league }: ActiveLeagueProps) {
  const statusConfig = {
    Active: { label: 'LIVE', color: 'bg-green-500/20 text-green-600 stroke-green-600 border-green-500/40', icon: Trophy },
    Draft: { label: 'DRAFT', color: 'bg-blue-500/20 text-blue-600 stroke-blue-600 border-blue-500/40', icon: Clock },
    Predraft: { label: 'UPCOMING', color: 'bg-yellow-500/20 text-yellow-600 stroke-yellow-600 border-yellow-500/40', icon: Clock },
    Inactive: { label: 'ENDED', color: 'bg-gray-500/20 text-gray-600 stroke-gray-600 border-gray-500/40', icon: Trophy },
  };

  const status = statusConfig[league.status] || statusConfig.Inactive;
  const StatusIcon = status.icon;

  return (
    <div className='space-y-4 px-2 mt-2'>
      <Link
        key={league.hash}
        href={`/leagues/${league.hash}`}
        className='group block'>
        <div className='relative bg-primary/5 border-2 border-primary/20 rounded-lg p-4 hover:bg-primary/10 hover:border-primary/30 transition-all'>
          {/* Status Badge */}
          <Badge className={cn('absolute top-0 right-0 flex items-center gap-1.5 rounded-md border-2 text-xs font-black tracking-wider pointer-events-none p-0', status.color)}>
            <StatusIcon className='w-3 h-3 stroke-inherit' />
            {status.label}
          </Badge>

          <div>
            <h3 className='text-lg md:text-3xl font-black leading-tight group-hover:text-primary transition-colors'>
              {league.name}
            </h3>
            <Badge variant='outline' className='border-primary/40 text-primary font-bold text-xs'>
              {league.season}
            </Badge>
          </div>

          {/* Arrow Icon */}
          <SquareArrowOutUpRight
            size={20}
            className='hidden sm:block absolute bottom-4 right-4 text-primary opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all' />
        </div>
      </Link>

      {league.status === 'Active'
        ? <Scoreboard overrideHash={league.hash} maxRows={5} className='bg-transparent' />
        : <div className='space-y-4'>
          <DraftCountdown overrideHash={league.hash} className='bg-primary/5 border border-primary/20 p-4 pt-1' />
          <DraftOrder overrideHash={league.hash} className='bg-primary/5 border border-primary/20 mb-4' scrollHeight='max-h-36 h-36' />
        </div>
      }
    </div>
  );
}

