'use client';

import {
  TableCell,
  TableRow,
} from '~/components/common/table';
import { useLeague } from '~/hooks/useLeague';
import { cn } from '~/lib/utils';
import type { EpisodeNumber } from '~/types/episodes';
import {
  type BaseEvent, BaseEventFullName, baseEventLabelPrefixes, baseEventLabels, type BaseEventRule
} from '~/types/events';
import { type LeagueMemberDisplayName } from '~/types/leagueMembers';
import EditBaseEvent from '~/components/leagues/actions/events/base/edit';
import ColorRow from '~/components/shared/colorRow';
import PointsCell from '~/components/leagues/hub/activity/timeline/table/pointsCell';
import NotesCell from '~/components/leagues/hub/activity/timeline/table/notesCell';

interface BaseEventRowProps {
  className?: string;
  baseEvent: BaseEvent;
  episodeNumber: EpisodeNumber;
  baseEventRules: BaseEventRule;
  edit?: boolean;
  memberFilter?: LeagueMemberDisplayName[];
}

export default function BaseEventRow({
  baseEvent, episodeNumber, baseEventRules, edit, memberFilter, className
}: BaseEventRowProps) {
  const { leagueData, league } = useLeague();
  const { eventName, label, tribes, castaways, notes } = baseEvent;

  const members =
    castaways?.map((castaway) =>
      leagueData.selectionTimeline.castawayMembers[castaway]?.slice(
        0, episodeNumber + 1).pop());

  if (memberFilter && memberFilter.length > 0 &&
    !memberFilter.some((member) => members.includes(member))) return null;

  return (
    <TableRow className={className}>
      {edit ? <TableCell className='w-0'>
        <EditBaseEvent episodeNumber={episodeNumber} baseEvent={baseEvent} />
      </TableCell> : null}
      <TableCell className='text-nowrap'>
        <p className='text-xs text-muted-foreground'>{BaseEventFullName[eventName]}</p>
        { // disable because we want label to be ignored if empty string as well as undefined
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          label || (`${baseEventLabelPrefixes[eventName]} ${baseEventLabels[eventName]?.[0] ?? eventName}`)}
      </TableCell>
      <PointsCell baseEventName={eventName} baseEventRules={baseEventRules} />
      <TableCell className='text-center' style={{ height: 'inherit' }}>
        <div className='h-full grid auto-rows-fr items-center'>
          {tribes?.map((tribe, index) => (
            <ColorRow
              key={index}
              className='leading-tight px-1 w-min'
              color={leagueData.castaways.find((listItem) =>
                listItem.tribes.some((tribeEp) => tribeEp.tribeName === tribe))?.tribes
                .find((tribeEp) => tribeEp.tribeName === tribe)?.tribeColor}>
              {tribe}
            </ColorRow>
          ))}
        </div>
      </TableCell >
      <TableCell className='text-right'>
        <div className={cn(
          'text-xs flex flex-col h-full gap-0.5 items-end',
          castaways?.length === 1 && 'justify-center')}>
          {castaways?.map((castaway, index) => (
            <ColorRow
              key={index}
              className='leading-tight px-1 w-min'
              color={leagueData.castaways.find((listItem) =>
                listItem.fullName === castaway)?.tribes.findLast((tribeEp) =>
                  tribeEp.episode <= episodeNumber)?.tribeColor}>
              {castaway}
            </ColorRow>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <div className={cn(
          'flex flex-col text-xs h-full gap-0.5',
          members?.length === 1 && 'justify-center')}>
          {members?.map((member, index) =>
            member ?
              <ColorRow
                key={index}
                className='leading-tight px-1 w-min'
                color={league.members.list.find((listItem) =>
                  listItem.displayName === member)?.color}>
                {member}
              </ColorRow> :
              <ColorRow className='invisible leading-tight px-1 w-min' key={index}>
                None
              </ColorRow>
          )}
        </div>
      </TableCell>
      <NotesCell notes={notes} />
    </TableRow >
  );
}
