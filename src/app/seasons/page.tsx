'use client';

import { useState, useEffect } from 'react';
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

export default function SeasonsPage() {
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState('castaways');
  const { data: seasons } = useSeasons(true);
  const { data: seasonData } = useSeasonsData(true, selectedSeasonId ?? undefined);
  const season = seasonData?.[0];

  // Auto-select most recent season on mount
  useEffect(() => {
    if (!selectedSeasonId && seasons && seasons.length > 0) {
      setSelectedSeasonId(seasons[0]!.seasonId);
    }
  }, [seasons, selectedSeasonId]);

  return (
    <Tabs className='w-full' value={selectedTab} onValueChange={setSelectedTab}>
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
              onValueChange={(value) => setSelectedSeasonId(Number(value))}>
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
          <TabsTrigger value='castaways'>Castaways</TabsTrigger>
          <TabsTrigger value='timeline'>Tribes</TabsTrigger>
          <TabsTrigger value='events'>Events</TabsTrigger>
        </TabsList>
      </div>

      <ScrollArea className='overflow-y-visible px-4 md:h-[calc(100svh-13.5rem)] h-[calc(100svh-12.5rem-var(--navbar-height))]'>
        {selectedSeasonId ? (
          season ? (
            <div className='pb-4'>
              <TabsContent value='castaways'>
                <CastawaysView seasonData={season} />
              </TabsContent>

              <TabsContent value='timeline'>
                <TribesTimeline seasonData={season} />
              </TabsContent>

              <TabsContent value='events'>
                <EventTimeline seasonData={season} hideMemberFilter />
              </TabsContent>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center gap-4 mt-16'>
              <p className='text-primary'>Loading season...</p>
              <Image
                src='/Logo.png'
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
        <ScrollBar className='pb-4 pt-2' />
      </ScrollArea>
    </Tabs>
  );
}
