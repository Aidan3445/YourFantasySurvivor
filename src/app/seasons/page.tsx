'use client';

import { useState, useEffect } from 'react';
import { useSeasons } from '~/hooks/seasons/useSeasons';
import { useSeasonsData } from '~/hooks/seasons/useSeasonsData';
import SelectSeason from '~/components/home/scoreboard/selectSeason';
import { DynamicTabs, TabsContent, TabsList, TabsTrigger } from '~/components/common/tabs';
import CastawaysView from '~/components/seasons/castaways/view';
import EventsView from '~/components/seasons/events/view';
import TimelineView from '~/components/seasons/timeline/view';
import Image from 'next/image';

export default function SeasonsPage() {
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);
  const { data: seasons } = useSeasons(true);
  const { data: seasonData, isLoading } = useSeasonsData(true, selectedSeasonId ?? undefined);
  const season = seasonData?.[0];

  console.log(seasonData);

  // Auto-select most recent season on mount
  useEffect(() => {
    if (!selectedSeasonId && seasons && seasons.length > 0) {
      setSelectedSeasonId(seasons[0]!.seasonId);
    }
  }, [seasons, selectedSeasonId]);

  return (
    <main className='w-full p-4 flex flex-col gap-4'>
      <div className='flex flex-col gap-4 items-center bg-card rounded-lg p-6 shadow-md max-w-2xl mx-auto w-full'>
        <h1 className='text-4xl font-bold'>Survivor Seasons</h1>
        <p className='text-muted-foreground text-center'>
          Explore castaways, tribe timelines, and events from every season
        </p>

        {seasons && (
          <div className='w-full max-w-md'>
            <SelectSeason
              seasons={seasons.map(s => ({
                value: s.seasonId.toString(),
                label: s.name
              }))}
              value={selectedSeasonId?.toString() ?? ''}
              setValue={(value) => setSelectedSeasonId(Number(value))}
            />
          </div>
        )}
      </div>

      {selectedSeasonId && season ? (
        <DynamicTabs defaultValue='castaways' rules={[]}>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='castaways'>Castaways</TabsTrigger>
            <TabsTrigger value='timeline'>Timeline</TabsTrigger>
            <TabsTrigger value='events'>Events</TabsTrigger>
          </TabsList>

          <TabsContent value='castaways'>
            <CastawaysView seasonData={season} />
          </TabsContent>

          <TabsContent value='timeline'>
            <TimelineView seasonData={season} />
          </TabsContent>

          <TabsContent value='events'>
            <EventsView seasonData={season} />
          </TabsContent>
        </DynamicTabs>
      ) : (
        <div className='bg-card rounded-lg p-8 text-center'>
          {isLoading ? (
            <div className='flex flex-col items-center gap-4'>
              <p className='text-muted-foreground'>Loading seasons...</p>
              <Image
                src='/Logo.png'
                alt='Loading'
                width={150}
                height={150}
                className='animate-loading-spin w-auto h-auto'
              />
            </div>
          ) : (
            <p className='text-muted-foreground'>Select a season to get started</p>
          )}
        </div>
      )}
    </main>
  );
}
