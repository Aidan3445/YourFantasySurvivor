'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/common/accordion';
import { Select } from '@radix-ui/react-select';
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/common/select';
import { useIsMobile } from '~/hooks/ui/useMobile';
import { Label } from '~/components/common/label';
import { MultiSelect } from '~/components/common/multiSelect';
import { useEffect, useState, useMemo } from 'react';
import AirStatus from '~/components/leagues/hub/shared/airStatus/view';
import { BaseEventFullName } from '~/lib/events';
import { getAirStatus, getAirStatusPollingInterval } from '~/lib/episodes';
import { type SeasonsDataQuery } from '~/types/seasons';
import { cn } from '~/lib/utils';
import { type SelectionTimelines, type League, type LeagueRules } from '~/types/leagues';
import { type LeagueMember } from '~/types/leagueMembers';
import { type CustomEvents, type Predictions } from '~/types/events';

export interface LeagueData {
  league: League | undefined;
  selectionTimeline: SelectionTimelines | undefined;
  customEvents: CustomEvents | undefined;
  basePredictions: Predictions | undefined;
  leagueRules: LeagueRules | undefined;
  leagueMembers: {
    loggedIn?: LeagueMember;
    members: LeagueMember[];
  } | undefined;
}

export interface TimelineFiltersProps {
  seasonData: SeasonsDataQuery;
  leagueData?: LeagueData;
  setFilterCastaway: (_castawayIds: number[]) => void;
  setFilterTribe: (_tribeIds: number[]) => void;
  setFilterMember: (_memberIds: number[]) => void;
  setFilterEvent: (_eventNames: string[]) => void;
  setSelectedEpisode: (_episodeNumber?: number) => void;
  filterCastaway: number[];
  filterTribe: number[];
  filterMember: number[];
  filterEvent: string[];
  selectedEpisode?: number;
  hideMemberFilter?: boolean;
}

export default function TimelineFilters({
  seasonData,
  leagueData,
  setFilterCastaway,
  setFilterTribe,
  setFilterMember,
  setFilterEvent,
  setSelectedEpisode,
  filterCastaway,
  filterTribe,
  filterMember,
  filterEvent,
  selectedEpisode,
  hideMemberFilter = false
}: TimelineFiltersProps) {
  const isMobile = useIsMobile();
  const { leagueRules, leagueMembers } = leagueData ?? {};

  // Derive data from seasonData prop
  const castaways = useMemo(() => seasonData.castaways, [seasonData.castaways]);
  const tribes = useMemo(() => seasonData.tribes, [seasonData.tribes]);
  const episodes = useMemo(() => seasonData.episodes, [seasonData.episodes]);

  // State to trigger re-renders for air status updates
  const [pollingTick, setPollingTick] = useState(0);

  useEffect(() => {
    if (selectedEpisode !== undefined || !episodes) return;

    const latestEpisode = episodes.find((episode) => getAirStatus(episode.airDate, episode.runtime) === 'Airing') ??
      episodes.findLast((episode) => getAirStatus(episode.airDate, episode.runtime) === 'Aired') ??
      episodes[0];

    setSelectedEpisode(latestEpisode?.episodeNumber);
  }, [episodes, selectedEpisode, setSelectedEpisode]);

  // Dynamic polling based on next air status change
  useEffect(() => {
    const pollingInterval = getAirStatusPollingInterval(episodes);

    // No upcoming status changes, no need to poll
    if (pollingInterval === null) return;

    const timeoutId = setTimeout(() => {
      // Trigger re-render by updating state, which will recalculate the next interval
      setPollingTick((prev) => prev + 1);
    }, pollingInterval);

    return () => clearTimeout(timeoutId);
  }, [episodes, pollingTick]);

  const selectedEpisodeData = episodes?.find((ep) => ep.episodeNumber === selectedEpisode);

  return (
    <Accordion type='single' collapsible className='w-full'>
      <AccordionItem value='filter' className='border-none pt-2'>
        <span className='w-full flex flex-wrap items-center gap-x-4 md:items-baseline px-12 md:mr-14 justify-center'>
          <h2 className='text-lg font-bold text-card-foreground'>Activity</h2>
          <span className='flex flex-wrap gap-x-4 items-center justify-center'>
            <Select
              defaultValue={`${selectedEpisode}`}
              value={`${selectedEpisode}`}
              onValueChange={(value) => setSelectedEpisode(Number(value))}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select an episode'>
                  {selectedEpisode === -1 ? 'All Episodes' : selectedEpisodeData ? (
                    <>
                      {`${selectedEpisodeData.episodeNumber}:`} {selectedEpisodeData.title}
                      <div className='inline ml-1'>
                        <AirStatus
                          airDate={selectedEpisodeData.airDate}
                          airStatus={getAirStatus(selectedEpisodeData.airDate, selectedEpisodeData.runtime)}
                          showTime={false}
                          showDate={!isMobile} />
                      </div>
                    </>
                  ) : 'Select an episode'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='-1'>
                  All Episodes
                </SelectItem>
                {episodes?.map((episode) => (
                  <SelectItem key={episode.episodeNumber} value={`${episode.episodeNumber}`}>
                    {`${episode.episodeNumber}:`} {episode.title}
                    <div className='inline ml-1'>
                      <AirStatus
                        airDate={episode.airDate}
                        airStatus={getAirStatus(episode.airDate, episode.runtime)}
                        showTime={false}
                        showDate={!isMobile} />
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </span>
          <AccordionTrigger className='w-full'>
            Filters
          </AccordionTrigger>
        </span>
        <AccordionContent className='w-full flex-col md:flex-row flex flex-wrap justify-evenly items-center'>
          {castaways &&
            <div className='flex flex-col items-center'>
              <Label className='text-sm font-semibold text-muted-foreground'>
                Castaway Filter
              </Label>
              <MultiSelect
                className={cn('min-w-56', hideMemberFilter ? 'w-1/3' : 'w-1/4')}
                options={castaways.map((castaway) => ({
                  value: castaway.castawayId,
                  label: castaway.fullName
                }))}
                value={filterCastaway as unknown as string[]}
                onValueChange={(value) => setFilterCastaway(value as number[])}
                modalPopover
                placeholder='All Castaways'
              />
            </div>}
          {tribes &&
            <div className='flex flex-col items-center'>
              <Label className='text-sm font-semibold text-muted-foreground'>
                Tribe Filter
              </Label>
              <MultiSelect
                className={cn('min-w-56', hideMemberFilter ? 'w-1/3' : 'w-1/4')}
                options={tribes.map((tribe) => ({
                  value: tribe.tribeId,
                  label: tribe.tribeName
                }))}
                value={filterTribe as unknown as string[]}
                onValueChange={(value) => setFilterTribe(value as number[])}
                modalPopover
                placeholder='All Tribes'
              />
            </div>}
          {!hideMemberFilter && leagueMembers &&
            <div className='flex flex-col items-center'>
              <Label className='text-sm font-semibold text-muted-foreground'>
                Member Filter
              </Label>
              <MultiSelect
                className={cn('min-w-56', hideMemberFilter ? 'w-1/3' : 'w-1/4')}
                options={leagueMembers.members.map((member) => ({
                  value: member.memberId,
                  label: member.displayName
                }))}
                value={filterMember as unknown as string[]}
                onValueChange={(value) => setFilterMember(value as number[])}
                modalPopover
                placeholder='All Members'
              />
            </div>}
          <div className='flex flex-col items-center'>
            <Label className='text-sm font-semibold text-muted-foreground'>
              Event Filter
            </Label>
            <MultiSelect
              className={cn('min-w-56', hideMemberFilter ? 'w-1/3' : 'w-1/4')}
              options={[
                { label: 'Official Events', value: null },
                ...Object.entries(BaseEventFullName)
                  .map(([eventName, eventFullName]) => ({
                    value: eventName,
                    label: eventFullName
                  })),
                ...(leagueRules?.custom && Object.keys(leagueRules.custom).length > 0
                  ? [
                    { label: 'Custom Events', value: null },
                    ...Object.values(leagueRules?.custom ?? [])
                      .map((event) => ({
                        value: event.eventName,
                        label: event.eventName
                      }))
                  ] : [])
              ]}
              value={filterEvent}
              onValueChange={(value) => setFilterEvent(value as string[])}
              modalPopover
              placeholder='All Events'
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
