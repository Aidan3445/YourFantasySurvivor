'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/common/accordion';
import { Select } from '@radix-ui/react-select';
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/common/select';
import { useIsMobile } from '~/hooks/ui/useMobile';
import { Label } from '~/components/common/label';
import { MultiSelect } from '~/components/common/multiSelect';
import { useLeague } from '~/hooks/leagues/useLeague';
import { useEffect, useState } from 'react';
import AirStatus from '~/components/leagues/hub/shared/airStatus/view';
import { useLeagueRules } from '~/hooks/leagues/useRules';
import { useCastaways } from '~/hooks/seasons/useCastaways';
import { useTribes } from '~/hooks/seasons/useTribes';
import { useLeagueMembers } from '~/hooks/leagues/useLeagueMembers';
import { useEpisodes } from '~/hooks/seasons/useEpisodes';
import { BaseEventFullName } from '~/lib/events';
import { getAirStatus, getAirStatusPollingInterval } from '~/lib/episodes';


export interface TimelineFiltersProps {
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
  const isMobile = useIsMobile();
  const { data: league } = useLeague();
  const { data: leagueRules } = useLeagueRules();
  const { data: castaways } = useCastaways(league?.seasonId ?? null);
  const { data: tribes } = useTribes(league?.seasonId ?? null);
  const { data: leagueMembers } = useLeagueMembers();
  const { data: episodes } = useEpisodes(league?.seasonId ?? null);

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
    <Accordion type='single' collapsible>
      <AccordionItem value='filter' className='border-none'>
        <span className='w-full flex flex-wrap items-center gap-x-4 md:items-baseline px-12 md:mr-14 justify-center'>
          <h2 className='text-lg font-bold text-card-foreground'>Activity</h2>
          <span className='flex flex-wrap gap-x-4 items-center justify-center'>
            <Select
              defaultValue={`${selectedEpisode}`}
              value={`${selectedEpisode}`}
              onValueChange={(value) => setSelectedEpisode(Number(value))}>
              <SelectTrigger className='w-min'>
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
            <AccordionTrigger className='w-full'>
              Filters
            </AccordionTrigger>
          </span>
        </span>
        <AccordionContent className='w-full flex-col md:flex-row flex flex-wrap justify-evenly items-center gap-4 px-2'>
          {castaways &&
            <div className='w-min flex flex-col items-center'>
              <Label className='text-sm font-semibold text-muted-foreground'>
                Castaway Filter
              </Label>
              <MultiSelect
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
            <div className='w-min flex flex-col items-center'>
              <Label className='text-sm font-semibold text-muted-foreground'>
                Tribe Filter
              </Label>
              <MultiSelect
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
          {leagueMembers &&
            <div className='w-min flex flex-col items-center'>
              <Label className='text-sm font-semibold text-muted-foreground'>
                Member Filter
              </Label>
              <MultiSelect
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
                ...Object.values(leagueRules?.custom ?? [])
                  .map((event) => ({
                    value: event.eventName,
                    label: event.eventName
                  }))
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
