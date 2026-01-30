'use client';

import DraftTracker from '~/components/leagues/draft/draftTracker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/common/tabs';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import CastawaysView from '~/components/seasons/castaways/view';
import { useParams } from 'next/navigation';
import { useLeagueData } from '~/hooks/leagues/enrich/useLeagueData';
import { type SeasonsDataQuery } from '~/types/seasons';
import Spacer from '~/components/shared/floatingActions/spacer';

export default function DraftPage() {
  const params = useParams();
  const hash = params?.hash as string;
  const data = useLeagueData(hash);

  return (
    <Tabs className='w-full' defaultValue='draft'>
      <TabsList className='sticky flex w-full px-10 rounded-none z-50 bg-accent'>
        <TabsTrigger className='flex-1' value='draft'>Draft</TabsTrigger>
        <TabsTrigger className='flex-none w-fit' value='castaways'>Castaways</TabsTrigger>
      </TabsList>
      <ScrollArea className='overflow-y-visible px-4 md:h-[calc(100svh-10.5rem)] h-[calc(100svh-9rem-var(--navbar-height))]'>
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
        <Spacer />
        <ScrollBar className='pb-4 pt-2' />
      </ScrollArea>
    </Tabs>
  );
}
