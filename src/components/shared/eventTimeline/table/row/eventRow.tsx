'use client';

import { cn } from '~/lib/utils';
import { TableCell, TableRow } from '~/components/common/table';
import ColorRow from '~/components/shared/colorRow';
import PointsCell from '~/components/shared/eventTimeline/table/pointsCell';
import NotesCell from '~/components/shared/eventTimeline/table/notesCell';
import { type EnrichedEvent, type BaseEventName } from '~/types/events';
import { BaseEventFullName } from '~/lib/events';
import { useMemo } from 'react';
import EditEvent from '~/components/leagues/actions/events/edit';
import { useEventLabel } from '~/hooks/helpers/useEventLabel';
import CastawayPopover from '~/components/shared/castaways/castawayPopover';
import { getContrastingColor } from '@uiw/color-convert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/common/accordion';

interface EventRowProps {
  className?: string;
  event: EnrichedEvent;
  editCol?: boolean;
  isMock?: boolean;
  noMembers?: boolean;
}

export default function EventRow({ className, event, editCol: edit, isMock, noMembers }: EventRowProps) {
  const isBaseEvent = useMemo(() => event.eventSource === 'Base', [event.eventSource]);

  const label = useEventLabel(event.eventName, isBaseEvent, event.label);

  return (
    <TableRow className={className}>
      {edit ? (
        isMock ?
          <TableCell className='w-0' /> :
          <TableCell className='w-0'>
            <EditEvent event={event} />
          </TableCell>) :
        null}
      <TableCell className='text-nowrap text-start'>
        {isBaseEvent &&
          <p className='text-xs text-muted-foreground'>
            {BaseEventFullName[event.eventName as BaseEventName]}
          </p>}
        {label}
      </TableCell>
      <PointsCell points={event.points} />
      <TableCell className='text-center' style={{ height: 'inherit' }}>
        <div className='h-full grid auto-rows-fr items-center'>
          {event.referenceMap?.map(({ tribe }, index) => (
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
          {event.referenceMap?.map(({ pairs }) => (
            pairs.map(({ castaway }) =>
              <ColorRow
                key={castaway.castawayId}
                className='leading-tight px-1 w-min'
                color={castaway.tribe?.color ?? '#AAAAAA'}>
                <CastawayPopover castaway={castaway}>
                  <span
                    className='text-nowrap'
                    style={{
                      color: getContrastingColor(castaway.tribe?.color ?? '#AAAAAA')
                    }}>
                    {castaway.fullName}
                  </span>
                </CastawayPopover>
              </ColorRow>
            )
          ))}
        </div>
      </TableCell>
      {!noMembers && <TableCell>
        <div className={cn(
          'flex flex-col text-xs h-full gap-0.5',
          event.referenceMap.some((ref) => ref.pairs.some((pair) => pair.member)) && 'justify-center')}>
          {event.referenceMap?.map(({ pairs }, index) =>
            pairs.map(({ castaway, member }) => (
              <div key={`${castaway.castawayId}-${index}`} className='flex gap-1 items-start'>
                {member ? (
                  <ColorRow
                    className='leading-tight px-1 w-min h-min'
                    color={member.color}>
                    {member.displayName}
                  </ColorRow>
                ) : (
                  <ColorRow className='invisible leading-tight px-1 w-min' key={`${castaway.castawayId}-${index}`}>
                    None
                  </ColorRow>
                )}
                <Accordion type='single' collapsible>
                  <AccordionItem value='secondaries' className='border-none'>
                    <AccordionTrigger className='p-0 text-xs leading-tight text-muted-foreground stroke-muted-foreground'>
                      secondaries
                    </AccordionTrigger>
                    <AccordionContent className='p-0'>
                      <div className='flex flex-col gap-0.5'>
                        <span className='text-xs flex gap-1 items-center opacity-60'>
                          <ColorRow
                            className='leading-tight px-1 w-min'
                            color={'#A769A2'}>
                            Member 1
                          </ColorRow>
                        </span>
                        <span className='text-xs flex gap-1 items-center opacity-60'>
                          <ColorRow
                            className='leading-tight px-1 w-min'
                            color={'#0769A2'}>
                            Member 2
                          </ColorRow>
                        </span>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ))
          )}
        </div>
      </TableCell>}
      <NotesCell notes={event.notes} />
    </TableRow >
  );
}
