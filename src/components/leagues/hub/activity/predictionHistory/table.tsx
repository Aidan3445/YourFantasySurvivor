'use client';

import { Flame } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import {
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,
} from '~/components/common/table';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useCastaways } from '~/hooks/seasons/useCastaways';
import { useKeyEpisodes } from '~/hooks/seasons/useKeyEpisodes';
import { useTribes } from '~/hooks/seasons/useTribes';
import { useIsMobile } from '~/hooks/ui/useMobile';
import { BaseEventFullName } from '~/lib/events';
import { cn } from '~/lib/utils';
import { type PredictionWithEvent, type BaseEventName, type EventReference } from '~/types/events';

interface PredictionTableProps {
  predictions: PredictionWithEvent[];
}

export default function PredctionTable({ predictions }: PredictionTableProps) {
  const { data: league } = useLeague();
  const { data: keyEpisodes } = useKeyEpisodes(league?.seasonId ?? null);
  const { data: castaways } = useCastaways(league?.seasonId ?? null);
  const { data: tribes } = useTribes(league?.seasonId ?? null);
  const isMobile = useIsMobile();
  const hasBets = useMemo(() => predictions.some((pred) => pred.bet && pred.bet > 0), [predictions]);

  const findReferenceNames = useCallback((references?: EventReference[]) => {
    if (!castaways || !tribes || !references) return [{ short: 'TBD', full: 'TBD' }];
    const refs = references.map((ref) => {
      if (ref.type === 'Castaway') {
        const castaway = castaways.find((c) => c.castawayId === ref.id);
        return castaway ? {
          short: castaway.shortName,
          full: castaway.fullName,
        } : null;
      } else if (ref.type === 'Tribe') {
        const tribe = tribes.find((t) => t.tribeId === ref.id);
        return tribe ? {
          short: tribe.tribeName,
          full: tribe.tribeName,
        } : null;
      }
      return null;
    }).filter(Boolean) as { short: string; full: string }[];
    return refs.length > 0 ? refs : [{ short: 'TBD', full: 'TBD' }];
  }, [castaways, tribes]);

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
          .map((pred, index) => {
            return (
              <TableRow key={index} className='bg-b3'>
                <TableCell>
                  <div className='flex flex-col text-nowrap'>
                    {BaseEventFullName[pred.eventName as BaseEventName] ?? pred.eventName}
                    <span className='text-xs italic'>
                      {pred.timing.join(' - ')}
                    </span>
                  </div >
                </TableCell>
                <TableCell className='text-nowrap'>
                  <span className={cn('text-sm text-center',
                    pred.hit ?
                      pred.points > 0 ? 'text-green-800' : 'text-red-800' :
                      'text-muted-foreground')}>
                    {pred.points > 0 && pred.hit ? `+${pred.points}` : pred.points}
                    <Flame className={cn(
                      'inline align-top w-4 h-min',
                      pred.hit ?
                        pred.points > 0 ? 'stroke-green-800' : 'stroke-red-800' :
                        'stroke-muted-foreground'
                    )} />
                  </span>
                </TableCell>
                {
                  hasBets &&
                  <TableCell className='text-nowrap'>
                    {pred.bet && pred.bet > 0 ? (
                      pred.hit ? (
                        <span className='text-sm text-center text-green-800'>
                          +{pred.bet}
                          <Flame className='inline align-top w-4 h-min stroke-green-800' />
                        </span>
                      ) : (
                        <span className='text-sm text-center text-red-800'>
                          -{pred.bet}
                          <Flame className='inline align-top w-4 h-min stroke-red-800' />
                        </span>
                      )
                    ) : <span className='text-sm text-center text-muted-foreground'>-</span>}
                  </TableCell>
                }
                <TableCell>
                  {findReferenceNames([{ type: pred.referenceType, id: pred.referenceId }])
                    .map((res) => isMobile ? res.short : res.full)
                    .join(', ')}
                </TableCell>
                <TableCell>
                  {pred.timing.every((t) => t.includes('Weekly')) &&
                    (keyEpisodes?.previousEpisode?.episodeNumber ?? 0) >= pred.episodeNumber &&
                    !pred.event
                    ? (<span className='text-muted-foreground'>N/A</span>)
                    : (findReferenceNames(pred.event?.references)
                      .map((res) => isMobile ? res.short : res.full)
                      .join(', ')
                    )}
                </TableCell>
              </TableRow >
            );
          })}
      </TableBody >
    </Table >
  );
}

