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
import { Popover, PopoverContent, PopoverTrigger } from '~/components/common/popover';
import { PopoverArrow } from '@radix-ui/react-popover';
import { Button } from '~/components/common/button';

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
            pairs.map(({ castaway, member, secondaries }) => (
              <div key={`${castaway.castawayId}-${index}`} className='flex gap-1 items-center'>
                {member ? (
                  <ColorRow
                    className='leading-tight px-1 w-min'
                    color={member.color}>
                    {member.displayName}
                  </ColorRow>
                ) : (
                  <ColorRow className={cn(
                    'leading-tight px-1 w-min text-muted-foreground border-dashed',
                    secondaries?.length === 0 && 'invisible'
                  )}>
                    None
                  </ColorRow>
                )}
                {secondaries && secondaries.length > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='p-0 gap-0 py-0! h-min items-start rounded border-primary/20 text-muted-foreground'>
                        2<span className='text-[0.6rem] text-inherit font-normal'>nd</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-max border-2 border-primary/30 shadow-lg shadow-primary/20 bg-card p-2' side='left' sideOffset={-3}>
                      <PopoverArrow className='fill-primary' />
                      <div className='text-sm font-semibold uppercase tracking-wide text-center'>Secondaries</div>
                      <div className='flex flex-col gap-1 text-xs'>
                        {secondaries.map((secMember) => (
                          <ColorRow
                            key={`secondary-${secMember.memberId}`}
                            className='leading-tight px-1 w-min'
                            color={secMember.color}>
                            {secMember.displayName}
                          </ColorRow>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            ))
          )}
        </div>
      </TableCell>}
      <NotesCell notes={event.notes} />
    </TableRow >
  );
}
