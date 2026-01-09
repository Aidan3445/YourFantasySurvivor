'use client';

import { useState, useEffect } from 'react';
import { useSeasons } from '~/hooks/seasons/useSeasons';
import { useSeasonsData } from '~/hooks/seasons/useSeasonsData';
import { DynamicTabs, TabsContent, TabsList, TabsTrigger } from '~/components/common/tabs';
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
    <main className='w-full p-4 flex flex-col gap-4'>
      <div className='flex flex-col gap-4 items-center bg-card rounded-lg p-6 shadow-md max-w-2xl mx-auto w-full'>
        <div className='flex flex-col items-center gap-4 w-full justify-between'>
          <div className='flex-1 text-center'>
            <h1 className='text-4xl font-bold'>Survivor Seasons</h1>
            <p className='text-muted-foreground'>
              Explore castaways, tribe timelines, and events from every season
            </p>
          </div>

          {seasons && seasons.length > 0 && (
            <Select
              value={selectedSeasonId?.toString() ?? ''}
              onValueChange={(value) => setSelectedSeasonId(Number(value))}>
              <SelectTrigger>
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
      </div>

      {selectedSeasonId ? (
        season ? (
          <DynamicTabs value={selectedTab} onValueChange={setSelectedTab} rules={[]}>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='castaways'>Castaways</TabsTrigger>
              <TabsTrigger value='timeline'>Timeline</TabsTrigger>
              <TabsTrigger value='events'>Events</TabsTrigger>
            </TabsList>

            <TabsContent value='castaways'>
              <CastawaysView seasonData={season} />
            </TabsContent>

            <TabsContent value='timeline'>
              <TribesTimeline seasonData={season} />
            </TabsContent>

            <TabsContent value='events'>
              <EventTimeline seasonData={season} hideMemberFilter />
            </TabsContent>
          </DynamicTabs>
        ) : (
          <div className='bg-card rounded-lg p-8 text-center'>
            <div className='flex flex-col items-center gap-4'>
              <p className='text-muted-foreground'>Loading season...</p>
              <Image
                src='/Logo.png'
                alt='Loading'
                width={150}
                height={150}
                className='animate-loading-spin w-auto h-auto'
              />
            </div>
          </div>
        )
      ) : (
        <div className='bg-card rounded-lg p-8 text-center'>
          <p className='text-muted-foreground'>Select a season to get started</p>
        </div>
      )}
    </main>
  );
}
