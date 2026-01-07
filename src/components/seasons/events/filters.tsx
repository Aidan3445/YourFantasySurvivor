'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/common/accordion';
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/common/select';
import { Select } from '@radix-ui/react-select';
import { Label } from '~/components/common/label';
import { MultiSelect } from '~/components/common/multiSelect';
import { useIsMobile } from '~/hooks/ui/useMobile';
import { useEpisodes } from '~/hooks/seasons/useEpisodes';
import { getAirStatus, getAirStatusPollingInterval } from '~/lib/episodes';
import AirStatus from '~/components/leagues/hub/shared/airStatus/view';
import { BaseEventFullName } from '~/lib/events';
import { type EnrichedCastaway } from '~/types/castaways';
import { type Tribe } from '~/types/tribes';
import { useEffect, useState } from 'react';

export interface EventsFiltersProps {
  seasonId: number;
  castaways: EnrichedCastaway[];
  tribes: Tribe[];
  setFilterEpisode: (_episodeNumber: number | null) => void;
  setFilterCastaways: (_castawayIds: number[]) => void;
  setFilterTribes: (_tribeIds: number[]) => void;
  setFilterEventTypes: (_eventNames: string[]) => void;
  filterEpisode: number | null;
  filterCastaways: number[];
  filterTribes: number[];
  filterEventTypes: string[];
}

export default function EventsFilters({
  seasonId,
  castaways,
  tribes,
  setFilterEpisode,
  setFilterCastaways,
  setFilterTribes,
  setFilterEventTypes,
  filterEpisode,
  filterCastaways,
  filterTribes,
  filterEventTypes
}: EventsFiltersProps) {
  const isMobile = useIsMobile();
  const { data: episodes } = useEpisodes(seasonId);

  // State to trigger re-renders for air status updates
  const [pollingTick, setPollingTick] = useState(0);

  useEffect(() => {
    if (filterEpisode !== null || !episodes) return;

    const latestEpisode = episodes.find((episode) => getAirStatus(episode.airDate, episode.runtime) === 'Airing') ??
      episodes.findLast((episode) => getAirStatus(episode.airDate, episode.runtime) === 'Aired') ??
      episodes[0];

    setFilterEpisode(latestEpisode?.episodeNumber ?? -1);
  }, [episodes, filterEpisode, setFilterEpisode]);

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

  const selectedEpisodeData = episodes?.find((ep) => ep.episodeNumber === filterEpisode);

  return (
    <Accordion type='single' collapsible>
      <AccordionItem value='filter' className='border-none'>
        <span className='w-full flex flex-wrap items-center gap-x-4 md:items-baseline px-12 md:mr-14 justify-center'>
          <h2 className='text-lg font-bold text-card-foreground'>Base Events</h2>
          <span className='flex flex-wrap gap-x-4 items-center justify-center'>
            <Select
              defaultValue={`${filterEpisode}`}
              value={`${filterEpisode}`}
              onValueChange={(value) => setFilterEpisode(Number(value))}>
              <SelectTrigger className='w-min'>
                <SelectValue placeholder='Select an episode'>
                  {filterEpisode === -1 ? 'All Episodes' : selectedEpisodeData ? (
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
          <div className='w-min flex flex-col items-center'>
            <Label className='text-sm font-semibold text-muted-foreground'>
              Castaway Filter
            </Label>
            <MultiSelect
              options={castaways.map((castaway) => ({
                value: castaway.castawayId,
                label: castaway.fullName
              }))}
              value={filterCastaways as unknown as string[]}
              onValueChange={(value) => setFilterCastaways(value as number[])}
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
                value: tribe.tribeId,
                label: tribe.tribeName
              }))}
              value={filterTribes as unknown as string[]}
              onValueChange={(value) => setFilterTribes(value as number[])}
              modalPopover
              placeholder='All Tribes'
            />
          </div>
          <div className='w-min flex flex-col items-center'>
            <Label className='text-sm font-semibold text-muted-foreground'>
              Event Filter
            </Label>
            <MultiSelect
              options={Object.entries(BaseEventFullName).map(([eventName, eventFullName]) => ({
                value: eventName,
                label: eventFullName
              }))}
              value={filterEventTypes}
              onValueChange={(value) => setFilterEventTypes(value as string[])}
              modalPopover
              placeholder='All Events'
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
