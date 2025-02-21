import MemberEditForm from '~/components/leagues/customization/memberEdit';
import Chart from '~/components/leagues/main/chart';
import RecentActivity from '~/components/leagues/main/recentActivity';
import Scoreboard from '~/components/leagues/main/scoreboard';
import { ScrollArea, ScrollBar } from '~/components/ui/scrollArea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { leagueMemberAuth } from '~/lib/auth';
import { type LeaguePageProps } from './layout';
import ChangeSurvivor from '~/components/leagues/main/changeSurvivor';


export default async function LeaguePage({ params }: LeaguePageProps) {
  const { leagueHash } = await params;
  const { role } = await leagueMemberAuth(leagueHash);
  return (
    <main className='flex flex-col gap-0 w-full p-4 pb-0'>
      <Tabs
        className='col-span-2 w-full bg-secondary rounded-3xl border h-[calc(100vh-4rem)] max-md:h-[calc(100vh-6.5rem)] overflow-hidden'
        defaultValue='league'>
        <TabsList className='sticky z-50 top-0 grid grid-flow-col auto-cols-fr w-full px-10 rounded-b-none'>
          <TabsTrigger value='league'>League</TabsTrigger>
          {role !== 'Member' && <TabsTrigger value='score'>Score Events</TabsTrigger>}
        </TabsList>
        <ScrollArea className='h-full w-full'>
          <TabsContent value='league'>
            <div className='flex flex-col gap-4 w-full px-4 pb-12'>
              <span className='flex max-lg:flex-wrap gap-4 items-center'>
                <Scoreboard />
                <Chart />
              </span>
              <ChangeSurvivor />
              <RecentActivity />
            </div>
          </TabsContent>
          <TabsContent value='settings'>
            <MemberEditForm />
          </TabsContent>
          <ScrollBar orientation='vertical' />
        </ScrollArea>
      </Tabs>
    </main >
  );
}
