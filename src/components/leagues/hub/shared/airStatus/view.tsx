import { cn } from '~/lib/utils';
import { type AirStatus as EpAirStatus } from '~/types/episodes';

type AirStatusProps = {
  airDate: Date;
  airStatus: EpAirStatus;
  showDate?: boolean;
  showTime?: boolean;
};

export default function AirStatus({ airDate, airStatus, showDate = true, showTime = true }: AirStatusProps) {
  return (
    <span className='inline-flex gap-1 items-center text-sm text-muted-foreground text-nowrap'>
      {showDate && (showTime ? airDate.toLocaleString() : airDate.toLocaleDateString())}
      <div className={cn('text-destructive-foreground text-xs px-1 rounded-md text-nowrap w-full',
        airStatus === 'Aired' && 'bg-destructive',
        airStatus === 'Upcoming' && 'bg-amber-500',
        airStatus === 'Airing' && 'bg-green-600')}>
        {airStatus}
      </div>
    </span>
  );
}

