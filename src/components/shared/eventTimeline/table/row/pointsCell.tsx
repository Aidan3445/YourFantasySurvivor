import { Flame } from 'lucide-react';
import { TableCell } from '~/components/common/table';
import { cn } from '~/lib/utils';

interface PointsCellProps {
  points: number | null;
  neutral?: boolean;
}

export default function PointsCell({ points, neutral }: PointsCellProps) {
  return (
    <TableCell>
      <ColoredPoints points={points} neutral={neutral} />
    </TableCell>
  );
}

export function ColoredPoints({ points, neutral }: PointsCellProps) {
  if (!points) return null;

  return (
    <span className={cn(
      'text-nowrap text-sm text-center font-smibold flex items-center justify-center flex-nowrap',
      neutral ?
        'text-muted-foreground' :
        (points > 0
          ? 'text-green-700'
          : 'text-destructive')
    )}>
      {points < 0 || neutral ? points : `+${points}`}
      <Flame className={cn(
        'inline align-top w-4 h-4 -mt-0.5',
        neutral ?
          'stroke-muted-foreground' :
          (points > 0
            ? 'stroke-green-700'
            : 'stroke-destructive')
      )} />
    </span>
  );
}
