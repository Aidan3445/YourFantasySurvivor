'use client';

import { cn } from '~/lib/utils';
import { TableCell, TableRow } from '~/components/common/table';
import ColorRow from '~/components/shared/colorRow';
import PointsCell from '~/components/leagues/hub/activity/timeline/table/pointsCell';
import NotesCell from '~/components/leagues/hub/activity/timeline/table/notesCell';
import { type EnrichedEvent, type BaseEventName } from '~/types/events';
import { BaseEventFullName, BaseEventLabelPrefixes } from '~/lib/events';
import { useMemo } from 'react';
import EditEvent from '~/components/leagues/actions/events/edit';

interface EventRowProps {
  className?: string;
  event: EnrichedEvent;
  edit?: boolean;
}

export default function EventRow({ className, event, edit }: EventRowProps) {
  const isBaseEvent = useMemo(() => event.eventSource === 'Base', [event.eventSource]);

  const label = useMemo(() => {
    const trimmed = event.label?.trim();
    if (trimmed) return trimmed;

    if (isBaseEvent) {
      return `${BaseEventLabelPrefixes[event.eventName as BaseEventName]} ${event.eventName}`;
    }
    return event.eventName;
  }, [event.eventName, event.label, isBaseEvent]);

  return (
    <TableRow className={className}>
      {edit ?
        <TableCell className='w-0'>
          <EditEvent event={event} />
        </TableCell> :
        null}
      <TableCell className='text-nowrap'>
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
      </TableCell >
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
                {castaway.fullName}
              </ColorRow>
            )
          ))}
        </div>
      </TableCell>
      <TableCell>
        <div className={cn(
          'flex flex-col text-xs h-full gap-0.5',
          event.referenceMap.some((ref) => ref.pairs.some((pair) => pair.member)) && 'justify-center')}>
          {event.referenceMap?.flatMap(({ pairs }, index) =>
            pairs.map(({ member }) =>
              member ?
                <ColorRow
                  key={member.memberId}
                  className='leading-tight px-1 w-min'
                  color={member.color}>
                  {member.displayName}
                </ColorRow> :
                <ColorRow className='invisible leading-tight px-1 w-min' key={index}>
                  None
                </ColorRow>
            )
          )}
        </div>
      </TableCell>
      <NotesCell notes={event.notes} />
    </TableRow >
  );
}
