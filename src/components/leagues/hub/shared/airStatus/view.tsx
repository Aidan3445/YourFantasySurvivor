import { cn } from '~/lib/utils';
import { type AirStatus as EpAirStatus } from '~/types/episodes';

type AirStatusProps = {
  airDate: Date;
  airStatus: EpAirStatus;
  showDate?: boolean;
  showTime?: boolean;
};

function formatAirDate(date: Date) {
  const datePart = new Intl.DateTimeFormat('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
  }).format(date);

  const timePart = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);

  return `${datePart}, ${timePart}`;
}

export default function AirStatus({ airDate, airStatus, showDate = true, showTime = true }: AirStatusProps) {
  return (
    <span className='inline-flex gap-1 items-center text-sm text-muted-foreground text-nowrap'>
      {showDate && (showTime ? formatAirDate(airDate) : airDate.toLocaleDateString())}
      <div
        className={cn(
          'text-destructive-foreground text-xs px-1 rounded-md text-nowrap w-full',
          airStatus === 'Aired' && 'bg-destructive',
          airStatus === 'Upcoming' && 'bg-amber-500',
          airStatus === 'Airing' && 'bg-green-600'
        )}>
        {airStatus}
      </div>
    </span>
  );
}

