'use client';

import DraftTracker from '~/components/leagues/draft/draftTracker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/common/tabs';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import CastawaysView from '~/components/seasons/castaways/view';
import { useParams } from 'next/navigation';
import { useLeagueData } from '~/hooks/leagues/enrich/useLeagueData';
import { type SeasonsDataQuery } from '~/types/seasons';

export default function DraftPage() {
  const params = useParams();
  const hash = params?.hash as string;
  const data = useLeagueData(hash);

  return (
    <Tabs className='w-full' defaultValue='draft'>
      <TabsList className='sticky flex w-full px-10 rounded-none z-50 *:flex-1 [&>*:last-child]:flex-none [&>*:last-child]:w-fit bg-accent'>
        <TabsTrigger className='flex-1' value='draft'>Draft</TabsTrigger>
        <TabsTrigger className='flex-1' value='castaways'>Castaways</TabsTrigger>
      </TabsList>
      <ScrollArea className='overflow-y-visible px-4 md:h-[calc(100svh-7.5rem)] h-[calc(100svh-6.5rem-var(--navbar-height))]'>
        <div className='pb-4'>
          <TabsContent value='draft'>
            <DraftTracker hash={hash} />
          </TabsContent>
          <TabsContent value='castaways'>
            <CastawaysView
              seasonData={data as SeasonsDataQuery}
              leagueData={data} />
          </TabsContent>
        </div>
        <ScrollBar className='pb-4 pt-2' />
      </ScrollArea>
    </Tabs>
  );
}
