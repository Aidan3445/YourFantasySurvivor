import { Flame } from 'lucide-react';
import { TableCell } from '~/components/common/table';
import { cn } from '~/lib/utils';
import { type EnrichedEvent } from '~/types/events';

interface PointsCellProps {
  event: EnrichedEvent;
}

export default function PointsCell({ event }: PointsCellProps) {
  if (!event.points) return (
    <TableCell className='text-xs text-muted-foreground text-center'>N/A</TableCell>
  );

  return (
    <TableCell className={cn('text-sm text-center',
      event.points > 0 ? 'text-green-600' : 'text-destructive')}>
      {event.points > 0 ? `+${event.points}` : event.points}
      <Flame className={cn(
        'inline align-top w-4 h-min',
        event.points > 0 ? 'stroke-green-600' : 'stroke-destructive')} />
    </TableCell>
  );
}
