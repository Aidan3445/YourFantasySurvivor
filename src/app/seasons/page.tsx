'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSeasons } from '~/hooks/seasons/useSeasons';
import { useSeasonsData } from '~/hooks/seasons/useSeasonsData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/common/tabs';
import CastawaysView from '~/components/seasons/castaways/view';
import EventTimeline from '~/components/shared/eventTimeline/view';
import TribesTimeline from '~/components/seasons/tribes/view';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/common/select';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import Spacer from '~/components/shared/floatingActions/spacer';

const VALID_TABS = ['events', 'castaways', 'tribes'] as const;
type Tab = (typeof VALID_TABS)[number];

export default function SeasonsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paramSeason = searchParams.get('season');
  const paramTab = searchParams.get('tab');

  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(
    paramSeason ? Number(paramSeason) : null
  );
  const [selectedTab, setSelectedTab] = useState<Tab>(
    paramTab && VALID_TABS.includes(paramTab as Tab) ? (paramTab as Tab) : 'events'
  );

  const { data: seasons } = useSeasons(true);
  const { data: seasonData } = useSeasonsData(true, selectedSeasonId ?? undefined);
  const season = seasonData?.[0];

  const updateParams = useCallback(
    (seasonId: number | null, tab: Tab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (seasonId !== null) {
        params.set('season', seasonId.toString());
      } else {
        params.delete('season');
      }
      if (tab !== 'events') {
        params.set('tab', tab);
      } else {
        params.delete('tab');
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Auto-select most recent season on mount (only if no query param)
  useEffect(() => {
    if (!selectedSeasonId && seasons && seasons.length > 0) {
      const id = seasons[0]!.seasonId;
      setSelectedSeasonId(id);
      updateParams(id, selectedTab);
    }
  }, [seasons, selectedSeasonId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSeasonChange = (value: string) => {
    const id = Number(value);
    setSelectedSeasonId(id);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('episode');
    if (id !== null) params.set('season', id.toString());
    if (selectedTab !== 'events') params.set('tab', selectedTab);
    else params.delete('tab');
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleTabChange = (value: string) => {
    const tab = value as Tab;
    setSelectedTab(tab);
    updateParams(selectedSeasonId, tab);
  };

  return (
    <Tabs className='w-full' value={selectedTab} onValueChange={handleTabChange}>
      <div className='flex flex-col w-full justify-between bg-card shadow-lg shadow-primary/20'>
        <div className='px-4 py-4 flex flex-col items-center justify-center w-full'>
          <div className='text-center'>
            <span className='flex items-center justify-center gap-3 mb-2'>
              <span className='h-6 w-1 bg-primary rounded-full' />
              <h1 className='text-3xl md:text-4xl font-black uppercase tracking-tight'>Survivor Seasons</h1>
              <span className='h-6 w-1 bg-primary rounded-full' />
            </span>
            <p className='text-muted-foreground text-pretty text-sm md:text-base font-medium'>
              Explore castaways, tribe timelines, and events from every season
            </p>
          </div>

          {seasons && seasons.length > 0 && (
            <Select
              value={selectedSeasonId?.toString() ?? ''}
              onValueChange={handleSeasonChange}>
              <SelectTrigger className='max-w-lg mt-3 border-2 border-primary/20 hover:border-primary/40 bg-primary/5 font-medium'>
                <SelectValue placeholder='Select a season' />
              </SelectTrigger>
              <SelectContent>
                {seasons.map((season) => (
                  <SelectItem key={season.seasonId} value={season.seasonId.toString()}>
                    {season.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <TabsList className='sticky grid grid-flow-col auto-cols-fr w-full px-10 rounded-none z-50'>
          <TabsTrigger value='events'>Events</TabsTrigger>
          <TabsTrigger value='castaways'>Castaways</TabsTrigger>
          <TabsTrigger value='tribes'>Tribes</TabsTrigger>
        </TabsList>
      </div>

      <ScrollArea className='overflow-y-visible px-4 md:h-[calc(100svh-13.5rem)] h-[calc(100svh-12rem-var(--navbar-height))]'>
        {selectedSeasonId ? (
          season ? (
            <div className='pb-4'>
              <TabsContent value='events'>
                <EventTimeline seasonData={season} hideMemberFilter />
              </TabsContent>

              <TabsContent value='castaways'>
                <CastawaysView seasonData={season} />
              </TabsContent>

              <TabsContent value='tribes'>
                <TribesTimeline seasonData={season} />
              </TabsContent>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center gap-4 mt-16'>
              <p className='text-primary'>Loading season...</p>
              <Image
                src='/LogoDisc.png'
                alt='Loading'
                width={150}
                height={150}
                className='animate-loading-spin w-auto h-auto' />
            </div>
          )
        ) : (
          <div className='flex flex-col items-center justify-center gap-4 mt-16'>
            <p className='text-muted-foreground'>Select a season to get started</p>
          </div>
        )}
        <Spacer />
        <ScrollBar className='pb-4 pt-2' />
      </ScrollArea>
    </Tabs>
  );
}
