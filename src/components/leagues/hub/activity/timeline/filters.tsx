/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/common/accordion';
import { Select } from '@radix-ui/react-select';
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/common/select';
import { useIsMobile } from '~/hooks/useMobile';
import { Label } from '~/components/common/label';
import { MultiSelect } from '~/components/common/multiSelect';
import { BaseEventFullName, type BaseEventName, type CustomEventName, } from '~/types/events';
import { type LeagueMemberDisplayName } from '~/types/leagueMembers';
import { type CastawayName } from '~/types/castaways';
import { type TribeName } from '~/types/tribes';
import { useLeague } from '~/hooks/useLeague';
import { useEffect } from 'react';
import AirStatus from '~/components/leagues/hub/shared/airStatus/view';


export interface TimelineFiltersProps {
  setFilterCastaway: (castaways: CastawayName[]) => void;
  setFilterTribe: (tribes: TribeName[]) => void;
  setFilterMember: (members: LeagueMemberDisplayName[]) => void;
  setFilterEvent: (events: (BaseEventName | CustomEventName)[]) => void;
  setSelectedEpisode: (episodeNumber?: number) => void;
  filterCastaway: CastawayName[];
  filterTribe: TribeName[];
  filterMember: LeagueMemberDisplayName[];
  filterEvent: (BaseEventName | CustomEventName)[];
  selectedEpisode?: number;
}

export default function TimelineFilters({
  setFilterCastaway,
  setFilterTribe,
  setFilterMember,
  setFilterEvent,
  setSelectedEpisode,
  filterCastaway,
  filterTribe,
  filterMember,
  filterEvent,
  selectedEpisode
}: TimelineFiltersProps) {
  const {
    leagueData: {
      episodes,
      castaways,
      tribes,
    },
    league: {
      members: {
        list: members
      },
      customEventRules
    }
  } = useLeague();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (selectedEpisode) return;

    const latestEpisode = episodes.find((episode) =>
      episode.airStatus === 'Airing') ??
      episodes.findLast((episode) => episode.airStatus === 'Aired') ??
      episodes[0];
    setSelectedEpisode(latestEpisode?.episodeNumber);
  }, [episodes, selectedEpisode, setSelectedEpisode]);

  return (
    <Accordion type='single' collapsible>
      <AccordionItem value='filter' className='border-none'>
        <span className='w-full flex flex-wrap items-center gap-x-4 md:items-baseline px-12 mr-14 justify-center'>
          <h2 className='text-lg font-bold text-card-foreground'>Activity</h2>
          <span className='flex flex-wrap gap-x-4 items-center justify-center'>
            <Select
              defaultValue={`${selectedEpisode}`}
              value={`${selectedEpisode}`}
              onValueChange={(value) => setSelectedEpisode(Number(value))}>
              <SelectTrigger className='w-min'>
                <SelectValue placeholder='Select an episode' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='-1'>
                  All Episodes
                </SelectItem>
                {episodes.toReversed()
                  .map((episode) => (
                    <SelectItem key={episode.episodeNumber} value={`${episode.episodeNumber}`}>
                      {`${episode.episodeNumber}:`} {episode.episodeTitle}
                      <div className='inline ml-1'>
                        <AirStatus
                          airDate={episode.episodeAirDate}
                          airStatus={episode.airStatus}
                          showTime={false}
                          showDate={!isMobile} />
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <AccordionTrigger className='w-full'>
              Filters
            </AccordionTrigger>
          </span>
        </span>
        <AccordionContent className='w-full flex-col md:flex-row flex flex-wrap justify-evenly items-center gap-4 px-2'>
          <div className='w-min flex flex-col items-center'>
            <Label className='text-sm font-semibold text-muted-foreground'>
              Castaway Filter
            </Label>
            <MultiSelect
              options={castaways.map((castaway) => ({
                value: castaway.fullName,
                label: castaway.fullName
              }))}
              value={filterCastaway}
              onValueChange={(value) => setFilterCastaway(value as CastawayName[])}
              modalPopover
              placeholder='All Castaways'
            />
          </div>
          <div className='w-min flex flex-col items-center'>
            <Label className='text-sm font-semibold text-muted-foreground'>
              Tribe Filter
            </Label>
            <MultiSelect
              options={tribes.map((tribe) => ({
                value: tribe.tribeName,
                label: tribe.tribeName
              }))}
              value={filterTribe}
              onValueChange={(value) => setFilterTribe(value as TribeName[])}
              modalPopover
              placeholder='All Tribes'
            />
          </div>
          <div className='w-min flex flex-col items-center'>
            <Label className='text-sm font-semibold text-muted-foreground'>
              Member Filter
            </Label>
            <MultiSelect
              options={members.map((member) => ({
                value: member.displayName,
                label: member.displayName
              }))}
              value={filterMember}
              onValueChange={(value) => setFilterMember(value as LeagueMemberDisplayName[])}
              modalPopover
              placeholder='All Members'
            />
          </div>
          <div className='w-min flex flex-col items-center'>
            <Label className='text-sm font-semibold text-muted-foreground'>
              Event Filter
            </Label>
            <MultiSelect
              options={[
                { label: 'Official Events', value: null },
                ...Object.entries(BaseEventFullName)
                  .map(([eventName, eventFullName]) => ({
                    value: eventName,
                    label: eventFullName
                  })),
                { label: 'Custom Events', value: null },
                ...Object.values(customEventRules)
                  .map((event) => ({
                    value: event.eventName,
                    label: event.eventName
                  }))
              ]}
              value={filterEvent}
              onValueChange={(value) =>
                setFilterEvent(value as (BaseEventName | CustomEventName)[])}
              modalPopover
              placeholder='All Events'
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
