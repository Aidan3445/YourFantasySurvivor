import { TableCell } from '~/components/common/table';
import { PointsIcon } from '~/components/icons/generated';
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
      <PointsIcon className={cn(
        'inline align-top w-3 h-3 -mt-0.5',
        neutral ?
          'fill-muted-foreground' :
          (points > 0
            ? 'fill-green-700'
            : 'fill-destructive')
      )} />
    </span>
  );
}
