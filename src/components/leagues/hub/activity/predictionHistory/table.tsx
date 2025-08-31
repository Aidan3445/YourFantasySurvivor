import { Flame } from 'lucide-react';
import {
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,
} from '~/components/common/table';
import { cn } from '~/lib/utils';
import { BaseEventFullName, type Prediction } from '~/types/events';

interface PredictionTableProps {
  predictions: Prediction[];
}

export default function PredctionTable({ predictions }: PredictionTableProps) {
  const hasBets = predictions.some((pred) => pred.prediction.bet && pred.prediction.bet > 0);

  return (
    <Table className='transform-gpu will-change-transform'>
      <TableCaption className='sr-only'>Member Predictions</TableCaption>
      <TableHeader>
        <TableRow className='px-4 bg-white pointer-events-none'>
          <TableHead className='text-center'>Event</TableHead>
          <TableHead className='text-center'>Points</TableHead>
          {hasBets && <TableHead className='text-center'>Bet</TableHead>}
          <TableHead className='text-center'>Prediction</TableHead>
          <TableHead className='text-center'>Results</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {predictions.sort((a) => a.timing.some((t) => t.startsWith('Weekly')) ? 1 : -1)
          .map((pred) => {
            const hit = pred.results.some((res) =>
              res.referenceId === pred.prediction.referenceId &&
              res.referenceType === pred.prediction.referenceType);
            return (
              <TableRow key={pred.customEventRuleId ?? pred.eventName} className='bg-b3'>
                <TableCell>
                  <div className='flex flex-col text-nowrap'>
                    {BaseEventFullName[pred.eventName as keyof typeof BaseEventFullName] ??
                      pred.eventName}
                    <span className='text-xs italic'>
                      {pred.timing.join(' - ')}
                    </span>
                  </div >
                </TableCell >
                <TableCell>
                  <span className={cn('text-sm text-center',
                    hit ?
                      pred.points > 0 ? 'text-green-800' : 'text-red-800' :
                      'text-muted-foreground')}>
                    {pred.points > 0 && hit ? `+${pred.points}` : pred.points}
                    <Flame className={cn(
                      'inline align-top w-4 h-min',
                      hit ?
                        pred.points > 0 ? 'stroke-green-800' : 'stroke-red-800' :
                        'stroke-muted-foreground'
                    )} />
                  </span>
                </TableCell>
                {
                  hasBets &&
                  <TableCell>
                    {pred.prediction.bet && pred.prediction.bet > 0 ? (
                      hit ? (
                        <span className='text-sm text-center text-green-800'>
                          +{pred.prediction.bet}
                          <Flame className='inline align-top w-4 h-min stroke-green-800' />
                        </span>
                      ) : (
                        <span className='text-sm text-center text-red-800'>
                          -{pred.prediction.bet}
                          <Flame className='inline align-top w-4 h-min stroke-red-800' />
                        </span>
                      )
                    ) : <span className='text-sm text-center text-muted-foreground'>-</span>
                    }
                  </TableCell>
                }
                <TableCell>
                  <div className='md:hidden'>{pred.prediction.castawayShort ?? pred.prediction.tribe}</div>
                  <div className='hidden md:block'>{pred.prediction.castaway ?? pred.prediction.tribe}</div>
                </TableCell>
                <TableCell>
                  <div className='md:hidden'>
                    {pred.results.map((res) => res.castawayShort ?? res.tribe)
                      .join(', ') ||
                      <div className='text-muted-foreground'>TBD</div>
                    }
                  </div>
                  <div className='hidden md:block'>
                    {pred.results.map((res) => res.castaway ?? res.tribe)
                      .join(', ') ||
                      <div className='text-muted-foreground'>TBD</div>
                    }
                  </div>
                </TableCell>
              </TableRow >
            );
          })}
      </TableBody >
    </Table >
  );
}

