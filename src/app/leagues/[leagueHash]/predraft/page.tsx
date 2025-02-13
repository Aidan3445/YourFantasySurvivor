import Image from 'next/image';
import CustomEvents from '~/components/leagues/customization/customEvents';
import { LeagueSettingsTabContent } from '~/components/leagues/customization/leagueSettings';
import MemberEditForm from '~/components/leagues/customization/memberEdit';
import { DraftCountdown } from '~/components/leagues/draftCountdown';
import DraftOrder from '~/components/leagues/draftOrder';
import InviteLink from '~/components/leagues/inviteLink';
import LeagueHeader from '~/components/leagues/leagueHeader';
import LeagueScoring from '~/components/leagues/leagueScoring';
import { ScrollArea, ScrollBar } from '~/components/ui/scrollArea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';

export default async function LeaguePage() {
  return (
    <main className='flex flex-col gap-0 w-full'>
      <LeagueHeader />
      <div className='xl:grid xl:grid-cols-3 gap-4 px-4'>
        <Tabs
          className='col-span-2 w-full bg-secondary rounded-3xl border h-[calc(100vh-4rem)] overflow-hidden'
          defaultValue='draft'>
          <TabsList className='sticky z-50 top-0 grid grid-flow-col auto-cols-fr w-full px-10 rounded-b-none'>
            <TabsTrigger value='draft'>Draft Settings</TabsTrigger>
            <TabsTrigger value='member'>Member Settings</TabsTrigger>
            <TabsTrigger value='league'>
              League Settings
            </TabsTrigger>
          </TabsList>
          <ScrollArea className='h-full w-full'>
            <TabsContent value='draft'>
              <div className='flex flex-col gap-4 items-center w-full px-4 pb-12'>
                <InviteLink />
                <DraftCountdown />
                <DraftOrder />
                <LeagueScoring />
                <CustomEvents />
              </div>
            </TabsContent>
            <TabsContent value='member'>
              <MemberEditForm />
            </TabsContent>
            <LeagueSettingsTabContent />
            <ScrollBar orientation='vertical' />
          </ScrollArea>
        </Tabs>
        <section className='w-full h-[calc(100vh-4rem)] p-4 bg-secondary rounded-3xl border flex flex-col'>
          <h2 className='text-lg font-bold text-center'>League Chat</h2>
          <div className='flex flex-col gap-2 overflow-y-auto flex-1'>YO</div>
        </section>
      </div>
    </main >
  );
}


export interface Artwork {
  artist: string
  art: string
}

const works: Artwork[] = [
  {
    artist: 'Ornella Binni',
    art: 'https://images.unsplash.com/photo-1465869185982-5a1a7522cbcb?auto=format&fit=crop&w=300&q=80',
  },
  {
    artist: 'Tom Byrom',
    art: 'https://images.unsplash.com/photo-1548516173-3cabfa4607e9?auto=format&fit=crop&w=300&q=80',
  },
  {
    artist: 'Vladimir Malyavko',
    art: 'https://images.unsplash.com/photo-1494337480532-3725c85fd2ab?auto=format&fit=crop&w=300&q=80',
  },
];

export function ScrollAreaHorizontalDemo() {
  return (
    <ScrollArea className='w-96 whitespace-nowrap rounded-md border'>
      <div className='flex w-max space-x-4 p-4'>
        {works.map((artwork) => (
          <figure key={artwork.artist} className='shrink-0'>
            <div className='overflow-hidden rounded-md'>
              <Image
                src={artwork.art}
                alt={`Photo by ${artwork.artist}`}
                className='aspect-[3/4] h-fit w-fit object-cover'
                width={300}
                height={400}
              />
            </div>
            <figcaption className='pt-2 text-xs text-muted-foreground'>
              Photo by{' '}
              <span className='font-semibold text-foreground'>
                {artwork.artist}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
      <ScrollBar orientation='horizontal' />
    </ScrollArea>
  );
}
