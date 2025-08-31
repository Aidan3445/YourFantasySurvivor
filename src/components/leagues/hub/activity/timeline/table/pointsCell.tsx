import { Flame } from 'lucide-react';
import { TableCell } from '~/components/common/table';
import { cn } from '~/lib/utils';
import { type BaseEventName, type BaseEventRule, type ScoringBaseEventName, ScoringBaseEventNames } from '~/types/events';

interface PointsCellProps {
  baseEventName?: BaseEventName;
  baseEventRules?: BaseEventRule;
  points?: number;
}

export default function PointsCell({ baseEventName: eventName, baseEventRules, points }: PointsCellProps) {
  if ((!ScoringBaseEventNames.includes(eventName as ScoringBaseEventName) || !baseEventRules) &&
    !points)
    return <TableCell className='text-xs text-muted-foreground text-center'>N/A</TableCell>;

  points ??= baseEventRules?.[eventName as ScoringBaseEventName];

  return (
    <TableCell className={cn('text-sm text-center',
      points! > 0 ? 'text-green-600' : 'text-destructive')}>
      {points! > 0 ? `+${points}` : points}
      <Flame className={cn(
        'inline align-top w-4 h-min',
        points! > 0 ? 'stroke-green-600' : 'stroke-destructive')} />
    </TableCell>
  );
}
