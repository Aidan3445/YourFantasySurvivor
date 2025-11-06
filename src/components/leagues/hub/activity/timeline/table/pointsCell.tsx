import { Flame } from 'lucide-react';
import { TableCell } from '~/components/common/table';
import { cn } from '~/lib/utils';

interface PointsCellProps {
  points: number | null;
}

export default function PointsCell({ points }: PointsCellProps) {
  if (!points) return (
    <TableCell />
  );

  return (
    <TableCell className={cn('text-sm text-center',
      points > 0 ? 'text-green-600' : 'text-destructive')}>
      {points > 0 ? `+${points}` : points}
      <Flame className={cn(
        'inline align-top w-4 h-min',
        points > 0 ? 'stroke-green-600' : 'stroke-destructive')} />
    </TableCell>
  );
}
