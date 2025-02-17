import { LeagueSettings } from '~/components/leagues/customization/leagueSettings';
import MemberEditForm from '~/components/leagues/customization/memberEdit';
import { ScrollArea, ScrollBar } from '~/components/ui/scrollArea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';

export default async function LeaguePage() {
  return (
    <main className='flex flex-col gap-0 w-full'>
      <div className='p-4 pb-0'>
        <Tabs
          className='col-span-2 w-full bg-secondary rounded-3xl border h-[calc(100vh-4rem)] max-md:h-[calc(100vh-6.5rem)] overflow-hidden'
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
                Scoreboard
                <br />
                Make Predictions
                <br />
                League Settings/Scoring
              </div>
            </TabsContent>
            <TabsContent value='member'>
              <MemberEditForm />
              Leave League
            </TabsContent>
            <LeagueSettings />
            <ScrollBar orientation='vertical' />
          </ScrollArea>
        </Tabs>
      </div>
    </main>
  );
}
