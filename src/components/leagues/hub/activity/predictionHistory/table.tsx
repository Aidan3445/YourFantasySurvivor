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
import TimingPopover from '~/components/leagues/hub/activity/predictionHistory/timingPopover';
import { Popover, PopoverTrigger, PopoverContent } from '~/components/common/popover';
import { PopoverArrow } from '@radix-ui/react-popover';
import { Separator } from '~/components/common/separator';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';

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
    <ScrollArea className={cn(
      predictions.length >= 4 && 'max-h-44 **:data-radix-scroll-area-viewport:max-h-44',
      'transform-gpu will-change-transform'
    )}>
      <Table>
        <TableCaption className='sr-only'>Member Predictions</TableCaption>
        <TableHeader className='sticky top-0 z-10 bg-white'>
          <TableRow className='px-4 pointer-events-none h-8'>
            <TableHead className='text-center h-min'>Event</TableHead>
            <TableHead className='text-center h-min'>Points</TableHead>
            {hasBets && <TableHead className='text-center h-min'>Bet</TableHead>}
            <TableHead className='text-center h-min'>Prediction</TableHead>
            <TableHead className='text-center pr-4 h-min'>Results</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {predictions.sort((a) => a.timing.some((t) => t.startsWith('Weekly')) ? 1 : -1)
            .map((pred, index) => {
              return (
                <TableRow key={index} className='bg-b3'>
                  <TableCell>
                    <div className='flex text-nowrap gap-2'>
                      <TimingPopover timing={pred.timing} />
                      {BaseEventFullName[pred.eventName as BaseEventName] ?? pred.eventName}
                      {pred.eventEpisodeNumber !== pred.predictionEpisodeNumber &&
                        <Popover modal hover>
                          <PopoverTrigger className='text-muted-foreground text-xs -ml-2 -mt-2'>
                            ({pred.eventEpisodeNumber})
                          </PopoverTrigger>
                          <PopoverContent className='w-min'>
                            <PopoverArrow />
                            <p className='text-xs italic text-nowrap'>
                              Predicted episode {pred.predictionEpisodeNumber}
                            </p>
                            <Separator className='my-1 w-4/5 mx-auto' />
                            <p className='text-xs italic text-nowrap'>
                              Resolved episode {pred.eventEpisodeNumber}
                            </p>
                          </PopoverContent>
                        </Popover>
                      }
                    </div>
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
                        <span className={cn('text-sm text-center', {
                          'text-green-800': pred.hit,
                          'text-red-800': !pred.hit,
                          'text-muted-foreground': !pred.eventId,
                        })}>
                          {pred.eventId && (pred.hit ? '+' : '-')} {pred.bet}
                          <Flame className={cn('inline align-top w-4 h-min', {
                            'stroke-green-800': pred.hit,
                            'stroke-red-800': !pred.hit,
                            'stroke-muted-foreground': !pred.eventId,
                          })} />
                        </span>
                      ) : <span className='text-sm text-center text-muted-foreground'>-</span>}
                    </TableCell>
                  }
                  <TableCell>
                    {findReferenceNames([{ type: pred.referenceType, id: pred.referenceId }])
                      .map((res) => isMobile ? res.short : res.full)
                      .join(', ')}
                  </TableCell>
                  <TableCell className='pr-4'>
                    {pred.timing.every((t) => t.includes('Weekly')) &&
                      (keyEpisodes?.previousEpisode?.episodeNumber ?? 0) >= pred.predictionEpisodeNumber &&
                      !pred.event
                      ? (<span className='text-muted-foreground'>--</span>)
                      : (findReferenceNames(pred.event?.references)
                        .map((res) => isMobile ? res.short : res.full)
                        .join(', ')
                      )}
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      <ScrollBar orientation='vertical' className='mt-8 h-[calc(100%-32px)]' />
      <ScrollBar orientation='horizontal' hidden />
    </ScrollArea>
  );
}

