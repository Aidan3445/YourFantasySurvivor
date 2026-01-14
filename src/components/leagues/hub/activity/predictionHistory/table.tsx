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
        <TableHeader className='sticky top-0 z-10 bg-accent'>
          <TableRow className='px-4 h-10 border-b-2 border-primary/20 hover:bg-primary/10 transition-colors'>
            <TableHead className='text-center h-min font-bold uppercase text-xs tracking-wider'>Event</TableHead>
            <TableHead className='text-center h-min font-bold uppercase text-xs tracking-wider'>Points</TableHead>
            {hasBets && <TableHead className='text-center h-min w-22 font-bold uppercase text-xs tracking-wider'>Bet</TableHead>}
            <TableHead className='text-center h-min font-bold uppercase text-xs tracking-wider'>Prediction</TableHead>
            <TableHead className='text-center pr-4 h-min font-bold uppercase text-xs tracking-wider'>Results</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {predictions.sort((a) => a.timing.some((t) => t.startsWith('Weekly')) ? 1 : -1)
            .map((pred, index) => {
              return (
                <TableRow key={index} className='border-b border-primary/10 bg-secondary hover:bg-primary/5 transition-colors'>
                  <TableCell>
                    <div className='flex text-nowrap gap-2 items-center font-medium'>
                      <TimingPopover timing={pred.timing} />
                      {BaseEventFullName[pred.eventName as BaseEventName] ?? pred.eventName}
                      {pred.eventEpisodeNumber !== pred.predictionEpisodeNumber &&
                        <Popover modal hover>
                          <PopoverTrigger className='bg-primary/30 rounded-md hover:bg-primary/40 transition-colors p-0.5 place-items-center text-primary text-xs font-semibold'>
                            ({pred.eventEpisodeNumber})
                          </PopoverTrigger>
                          <PopoverContent className='w-min border-2 border-primary/30'>
                            <PopoverArrow />
                            <p className='text-xs font-medium text-nowrap'>
                              Predicted episode {pred.predictionEpisodeNumber}
                            </p>
                            <Separator className='my-1 w-4/5 mx-auto bg-primary/20' />
                            <p className='text-xs font-medium text-nowrap'>
                              Resolved episode {pred.eventEpisodeNumber}
                            </p>
                          </PopoverContent>
                        </Popover>
                      }
                    </div>
                  </TableCell>
                  <TableCell className='text-nowrap'>
                    <span className={cn('text-sm text-center font-bold',
                      pred.hit ?
                        pred.points > 0 ? 'text-green-700' : 'text-red-700' :
                        'text-muted-foreground')}>
                      {pred.points > 0 && pred.hit ? `+${pred.points}` : pred.points}
                      <Flame className={cn(
                        'inline align-top w-4 h-min ml-0.5',
                        pred.hit ?
                          pred.points > 0 ? 'stroke-green-700' : 'stroke-red-700' :
                          'stroke-muted-foreground'
                      )} />
                    </span>
                  </TableCell>
                  {hasBets &&
                    <TableCell className='text-nowrap'>
                      {pred.bet && pred.bet > 0 ? (
                        <span className={cn('text-sm text-center font-bold', {
                          'text-green-700': pred.hit,
                          'text-red-700': !pred.hit,
                          'text-muted-foreground': !pred.eventId,
                        })}>
                          {pred.eventId && (pred.hit ? '+' : '-')} {pred.bet}
                          <Flame className={cn('inline align-top w-4 h-min ml-0.5', {
                            'stroke-green-700': pred.hit,
                            'stroke-red-700': !pred.hit,
                            'stroke-muted-foreground': !pred.eventId,
                          })} />
                        </span>
                      ) : <span className='text-sm text-center text-muted-foreground font-medium'>-</span>}
                    </TableCell>
                  }
                  <TableCell className='font-medium'>
                    {findReferenceNames([{ type: pred.referenceType, id: pred.referenceId }])
                      .map((res) => isMobile ? res.short : res.full)
                      .join(', ')}
                  </TableCell>
                  <TableCell className='pr-4 font-medium'>
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
      <ScrollBar orientation='vertical' className='mt-10 h-[calc(100%-2.5rem)]' />
      <ScrollBar orientation='horizontal' hidden />
    </ScrollArea>
  );
}

