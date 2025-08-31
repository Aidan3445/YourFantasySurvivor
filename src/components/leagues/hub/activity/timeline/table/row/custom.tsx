'use client';

import { Flame, MoveRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/common/accordion';
import { TableCell, TableRow } from '~/components/common/table';
import { useLeague } from '~/hooks/useLeague';
import { cn } from '~/lib/utils';
import type { EpisodeNumber } from '~/types/episodes';
import { type CustomEventName, type ReferenceType } from '~/types/events';
import { type LeagueMemberDisplayName } from '~/types/leagueMembers';
import ColorRow from '~/components/shared/colorRow';
import EditCustomEvent from '~/components/leagues/actions/events/custom/edit';
import { type CastawayName } from '~/types/castaways';
import { type TribeName } from '~/types/tribes';
import NotesCell from '~/components/leagues/hub/activity/timeline/notesCell';
import PointsCell from '~/components/leagues/hub/activity/timeline/table/pointsCell';

interface CustomEventRowProps {
  className?: string;
  eventName: CustomEventName;
  eventId?: number;
  points: number;
  referenceType: ReferenceType;
  referenceNames?: string[];
  referenceIds?: number[];
  predictionMakers?: {
    displayName: LeagueMemberDisplayName,
    bet?: number | null
  }[];
  notes: string[] | null;
  misses?: {
    displayName: LeagueMemberDisplayName;
    bet?: number | null;
    // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents
    referenceName: CastawayName | TribeName;
  }[];
  defaultOpenMisses?: boolean;
  episodeNumber: EpisodeNumber;
  edit?: boolean;
}

export default function CustomEventRow({
  eventName,
  eventId,
  points,
  referenceType,
  referenceNames,
  referenceIds,
  predictionMakers,
  notes,
  misses,
  defaultOpenMisses,
  episodeNumber,
  edit,
  className
}: CustomEventRowProps) {
  const { leagueData, league } = useLeague();

  return (
    <TableRow className={className}>
      {edit && eventId ? <TableCell className='w-0'>
        <EditCustomEvent episodeNumber={episodeNumber} customEvent={{
          eventId,
          eventName,
          points,
          referenceType,
          referenceId: referenceIds?.[0] ? referenceIds[0] : 0,
          notes
        }} />
      </TableCell> :
        edit === false ? <TableCell className='w-0' /> : null}
      <TableCell className='text-nowrap sticky'>{eventName}</TableCell>
      <PointsCell points={points} />
      <TableCell className='text-right text-xs text-nowrap'>
        <div className='h-full grid auto-rows-fr items-center'>
          {referenceType === 'Tribe' && referenceNames?.map((referenceName) => (
            <ColorRow
              key={referenceName}
              className='leading-tight px-1 w-min'
              color={leagueData.castaways.find((listItem) =>
                listItem.tribes.some((tribeEp) => tribeEp.tribeName === referenceName))?.tribes
                .find((tribeEp) => tribeEp.tribeName === referenceName)?.tribeColor}>
              {referenceName}
            </ColorRow>
          ))}
        </div>
      </TableCell>
      <TableCell className='text-right text-xs text-nowrap justify-items-end'>
        {referenceType === 'Castaway' && referenceNames?.map((referenceName) => (
          <ColorRow
            key={referenceName}
            className='leading-tight px-1 w-min'
            color={leagueData.castaways.find((listItem) =>
              listItem.fullName === referenceName)?.tribes.findLast((tribeEp) =>
                tribeEp.episode <= episodeNumber)?.tribeColor}>
            {referenceName}
          </ColorRow>
        ))}
      </TableCell>
      <TableCell className='text-xs text-nowrap'>
        <div className={cn(
          'flex flex-col text-xs h-full gap-0.5 relative',
          predictionMakers?.length === 1 && 'justify-center')}>
          {predictionMakers?.map(({ displayName, bet }, index) =>
            <span className='flex items-center gap-1' key={index}>
              {
                displayName ?
                  <ColorRow
                    className='leading-tight px-1 w-min'
                    color={league.members.list.find((listItem) =>
                      listItem.displayName === displayName)?.color}>
                    {displayName}
                  </ColorRow> :
                  <ColorRow className='invisible leading-tight px-1 w-min' key={index}>
                    None
                  </ColorRow>
              }
              {bet !== undefined && bet !== null && (
                <span className='text-xs text-green-600'>
                  +{bet}
                  <Flame className='inline align-baseline w-3 h-min stroke-green-600' />
                </span>
              )}
            </span>
          )}
          {misses && misses.length > 0 &&
            <Accordion
              type='single'
              collapsible
              value={defaultOpenMisses ? 'misses' : undefined}>
              <AccordionItem value='misses' className='border-none'>
                <AccordionTrigger className='p-0 text-xs leading-tight text-muted-foreground stroke-muted-foreground'>
                  Missed Predictions
                </AccordionTrigger>
                <AccordionContent className='p-0'>
                  <div className='flex flex-col gap-0.5'>
                    {misses.map((miss, index) => (
                      <span key={index} className='text-xs flex gap-1 items-center opacity-60'>
                        <ColorRow
                          className='leading-tight px-1 w-min'
                          color={league.members.list.find((listItem) =>
                            listItem.displayName === miss.displayName)?.color}>
                          {miss.displayName}
                        </ColorRow>
                        <MoveRight size={12} stroke='#000000' />
                        <ColorRow
                          className='leading-tight px-1 w-min'
                          color={referenceType === 'Castaway' ?
                            leagueData.castaways.find((castaway) =>
                              castaway.fullName === miss.referenceName)?.tribes
                              .findLast((tribeEp) => tribeEp.episode <= episodeNumber)?.tribeColor :
                            leagueData.tribes.find((tribe) =>
                              tribe.tribeName === miss.referenceName)?.tribeColor}>
                          {miss.referenceName}
                        </ColorRow>
                        {miss.bet !== undefined && miss.bet !== null && (
                          <span className='text-xs text-destructive'>
                            -{miss.bet}
                            <Flame className='inline align-baseline w-3 h-min stroke-destructive' />
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>}
        </div>
      </TableCell>
      <NotesCell notes={notes} />
    </TableRow>
  );
}

