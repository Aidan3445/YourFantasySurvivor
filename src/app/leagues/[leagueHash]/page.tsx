import { LeagueSettings } from '~/components/leagues/customization/leagueSettings';
import MemberEditForm from '~/components/leagues/customization/memberEdit';
import Scoreboard from '~/components/leagues/main/scoreboard';
import { ScrollArea, ScrollBar } from '~/components/ui/scrollArea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';


export default async function LeaguePage() {
  return (
    <main className='flex flex-col gap-0 w-full p-4 pb-0'>
      <Tabs
        className='col-span-2 w-full bg-secondary rounded-3xl border h-[calc(100vh-4rem)] max-md:h-[calc(100vh-6.5rem)] overflow-hidden'
        defaultValue='league'>
        <TabsList className='sticky z-50 top-0 grid grid-flow-col auto-cols-fr w-full px-10 rounded-b-none'>
          <TabsTrigger value='league'>League</TabsTrigger>
        </TabsList>
        <ScrollArea className='h-full w-full'>
          <TabsContent value='league'>
            <Scoreboard />
          </TabsContent>
          <TabsContent value='member'>
            <MemberEditForm />
            Leave League
            <LeagueSettings />
          </TabsContent>
          <ScrollBar orientation='vertical' />
        </ScrollArea>
      </Tabs>
    </main>
  );
}
