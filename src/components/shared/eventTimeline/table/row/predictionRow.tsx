'use client';

import { useMemo } from 'react';
import { TableCell, TableRow } from '~/components/common/table';
import { useEventLabel } from '~/hooks/helpers/useEventLabel';
import { BaseEventFullName } from '~/lib/events';
import { type BaseEventName, type EnrichedPrediction } from '~/types/events';
import PointsCell from '~/components/shared/eventTimeline/table/row/pointsCell';
import ColorRow from '~/components/shared/colorRow';
import { cn } from '~/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/common/accordion';
import { Flame, MoveRight } from 'lucide-react';
import CastawayPopover from '~/components/shared/castaways/castawayPopover';

interface PredictionRowProps {
  className?: string;
  prediction: EnrichedPrediction;
  editCol?: boolean;
  defaultOpenMisses?: boolean;
  noMembers?: boolean;
}

export default function PredictionRow({ className, prediction, editCol, defaultOpenMisses, noMembers }: PredictionRowProps) {
  const isBaseEvent = useMemo(() => prediction.event.eventSource === 'Base', [prediction.event.eventSource]);
  const label = useEventLabel(prediction.event.eventName, isBaseEvent, prediction.event.label);

  const event = prediction.event;

  return (
    <TableRow className={className}>
      {editCol && <TableCell className='w-0' />}
      <TableCell className='text-nowrap text-start'>
        {isBaseEvent &&
          <p className='text-xs text-muted-foreground'>
            {BaseEventFullName[event.eventName as BaseEventName]}
          </p>}
        {label}
      </TableCell>
      <PointsCell points={prediction.points} />
      <TableCell className='text-center' style={{ height: 'inherit' }}>
        <div className='h-full grid auto-rows-fr items-center'>
          {event.referenceMap.map(({ tribe }, index) => (
            tribe &&
            <ColorRow
              key={index}
              className='leading-tight px-1 w-min'
              color={tribe.tribeColor}>
              {tribe.tribeName}
            </ColorRow>
          ))}
        </div>
      </TableCell>
      <TableCell className='text-right'>
        <div className={cn(
          'text-xs flex flex-col h-full gap-0.5 items-end',
          event.referenceMap.some((ref) => ref.pairs.some((pair) => pair.castaway)) && 'justify-center')}>
          {event.referenceMap.map(({ pairs }) => (
            pairs.map(({ castaway }) =>
              <ColorRow
                key={castaway.castawayId}
                className='leading-tight px-1'
                color={castaway.tribe?.color ?? '#AAAAAA'}>
                <CastawayPopover castaway={castaway}>
                  <span className='text-nowrap'>
                    {castaway.fullName}
                  </span>
                </CastawayPopover>
              </ColorRow>
            )
          ))}
        </div>
      </TableCell>
      {!noMembers && <TableCell colSpan={2} className='text-xs text-nowrap'>
        <div className='flex flex-col text-xs h-full gap-0.5 relative justify-center'>
          {prediction.hits.length > 0 &&
            prediction.hits.map((hit, index) =>
              <span key={index} className='flex gap-1 items-center'>
                <ColorRow
                  className='leading-tight px-1 w-min'
                  color={hit.member.color}>
                  {hit.member.displayName}
                  {(hit.bet ?? 0) > 0 && <p className='text-xs text-green-600 text-nowrap'>
                    +{hit.bet}
                    <Flame className='inline align-top w-3.5 h-min stroke-green-600' />
                  </p>}
                </ColorRow>
                {event.references.length > 1 && hit.reference &&
                  <>
                    <MoveRight size={12} stroke='#000000' />
                    <ColorRow
                      className='leading-tight px-1 w-min'
                      color={hit.reference.color}>
                      {hit.reference.name}
                    </ColorRow>
                  </>
                }
              </span>
            )}
          {prediction.misses.length > 0 &&
            <Accordion
              type='single'
              collapsible
              value={defaultOpenMisses ? 'misses' : undefined}>
              <AccordionItem value='misses' className='border-none'>
                <AccordionTrigger className='p-0 text-xs leading-tight text-nowrap text-muted-foreground stroke-muted-foreground'>
                  Missed Predictions
                </AccordionTrigger>
                <AccordionContent className='p-0'>
                  <div className='flex flex-col gap-0.5'>
                    {prediction.misses.map((miss, index) => (
                      <span key={index} className='text-xs flex gap-1 items-center opacity-60'>
                        <ColorRow
                          className='leading-tight px-1 w-min'
                          color={miss.member.color}>
                          {miss.member.displayName}
                          {(miss.bet ?? 0) > 0 && (
                            <p className='text-xs text-red-600 text-nowrap'>
                              -{miss.bet}
                              <Flame className='inline align-top w-3.5 h-min stroke-red-600' />
                            </p>
                          )}
                        </ColorRow>
                        {miss.reference &&
                          <>
                            <MoveRight size={12} stroke='#000000' />
                            <ColorRow
                              className='leading-tight px-1 w-min'
                              color={miss.reference.color}>
                              {miss.reference.name}
                            </ColorRow>
                          </>
                        }
                      </span>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          }
        </div>
      </TableCell>
      }
    </TableRow>
  );
}
