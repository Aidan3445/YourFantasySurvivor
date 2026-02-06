'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/common/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/common/select';
import { useIsMobile } from '~/hooks/ui/useMobile';
import { Label } from '~/components/common/label';
import { MultiSelect } from '~/components/common/multiSelect';
import { useEffect, useState, useMemo } from 'react';
import AirStatus from '~/components/leagues/hub/shared/airStatus/view';
import { BaseEventFullName } from '~/lib/events';
import { getAirStatusPollingInterval } from '~/lib/episodes';
import { type SeasonsDataQuery } from '~/types/seasons';
import { cn } from '~/lib/utils';
import { type SelectionTimelines, type League, type LeagueRules, type LeagueSettings } from '~/types/leagues';
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
  streaks?: Record<number, Record<number, number>>;
  leagueSettings?: LeagueSettings;
  shotInTheDarkStatus: Record<number, {
    episodeNumber: number;
    status: 'pending' | 'saved' | 'wasted';
  } | null>

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

    const latestEpisode = episodes.find((episode) => episode.airStatus === 'Airing') ??
      episodes.findLast((episode) => episode.airStatus === 'Aired') ??
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
      <AccordionItem value='filter' className='border-none'>
        <div className='w-full flex flex-wrap gap-x-4 items-center justify-between'>
          <div className='flex items-center gap-3 h-8'>
            <span className='h-4 md:h-6 w-1 bg-primary rounded-full' />
            <h2 className='md:text-xl font-black uppercase tracking-tight leading-none text-nowrap'>
              Activity
            </h2>
          </div>
          <span className='flex flex-wrap gap-x-4 items-center justify-center'>
            <Select
              defaultValue={`${selectedEpisode}`}
              value={`${selectedEpisode}`}
              onValueChange={(value) => setSelectedEpisode(Number(value))}>
              <SelectTrigger className='w-full border-2 border-primary/20 hover:border-primary/40 bg-primary/5 font-medium'>
                <SelectValue placeholder='Select an episode'>
                  {selectedEpisode === -1 ? 'All Episodes' : selectedEpisodeData ? (
                    <>
                      <span className='font-bold'>EP {selectedEpisodeData.episodeNumber}:</span> {selectedEpisodeData.title}
                      <div className='inline ml-1'>
                        <AirStatus
                          airDate={selectedEpisodeData.airDate}
                          airStatus={selectedEpisodeData.airStatus}
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
                    <span className='font-bold'>EP {episode.episodeNumber}:</span> {episode.title}
                    <div className='inline ml-1'>
                      <AirStatus
                        airDate={episode.airDate}
                        airStatus={episode.airStatus}
                        showTime={false}
                        showDate={!isMobile} />
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </span>
          <AccordionTrigger className='w-full font-bold uppercase text-xs tracking-wider z-10'>
            Filters
          </AccordionTrigger>
        </div>
        <AccordionContent className='w-full flex-col md:flex-row flex flex-wrap justify-evenly items-center gap-4 pb-4'>
          {castaways &&
            <div className='flex flex-col items-center gap-2'>
              <Label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
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
                maxCount={0}
                placeholder='All Castaways'
              />
            </div>}
          {tribes &&
            <div className='flex flex-col items-center gap-2'>
              <Label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
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
                maxCount={0}
                placeholder='All Tribes'
              />
            </div>}
          {!hideMemberFilter && leagueMembers &&
            <div className='flex flex-col items-center gap-2'>
              <Label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
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
                maxCount={0}
                placeholder='All Members'
              />
            </div>}
          <div className='flex flex-col items-center gap-2'>
            <Label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
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
              maxCount={0}
              placeholder='All Events'
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
