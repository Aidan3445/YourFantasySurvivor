import MemberEditForm from '~/components/leagues/customization/memberEdit';
import Chart from '~/components/leagues/main/chart';
import RecentActivity from '~/components/leagues/main/recentActivity';
import Scoreboard from '~/components/leagues/main/scoreboard';
import { ScrollArea, ScrollBar } from '~/components/ui/scrollArea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { leagueMemberAuth, systemAdminAuth } from '~/lib/auth';
import { type LeaguePageProps } from './layout';
import ChangeSurvivor from '~/components/leagues/main/changeSurvivor';
import CreateBaseEvent from '~/components/leagues/main/createBaseEvent';
import CustomEvents from '~/components/leagues/customization/customEvents';
import { LeagueSettings } from '~/components/leagues/customization/leagueSettings';
import LeagueScoring from '~/components/leagues/leagueScoring';
import CreateCustomEvent from '~/components/leagues/main/createCustomEvent';
import Predictions from '~/components/leagues/main/predictions';

export default async function LeaguePage({ params }: LeaguePageProps) {
  const { leagueHash } = await params;
  const { role } = await leagueMemberAuth(leagueHash);
  const { userId } = await systemAdminAuth();
  return (
    <main className='flex flex-col gap-0 w-full md:p-4 pb-0 md:h-auto'>
      <Tabs
        className='w-full md:bg-secondary rounded-3xl md:border md:h-[calc(100svh-4rem)] md:overflow-hidden'
        defaultValue='scores'>
        <TabsList className='sticky top-10 md:static grid grid-flow-col auto-cols-fr w-full px-10 rounded-none z-50'>
          <TabsTrigger value='scores'>Scores</TabsTrigger>
          {role !== 'Member' && <TabsTrigger value='events'>Commish</TabsTrigger>}
          <TabsTrigger value='settings'>Settings</TabsTrigger>
        </TabsList>
        <ScrollArea className='h-full'>
          <TabsContent value='scores'>
            <div className='space-y-4 w-full md:pb-10 place-items-center px-4'>
              <span className='w-full grid grid-cols-1 grid-rows-2 lg:grid-cols-2 md:grid-rows-1 gap-4 items-center justify-center overflow-x-auto'>
                <Scoreboard />
                <Chart />
              </span>
              <Predictions leagueHash={leagueHash} />
              <ChangeSurvivor />
              <RecentActivity />
            </div>
          </TabsContent>
          <TabsContent value='events'>
            <div className=' w-full px-4 pb-10'>
              <CreateCustomEvent />
              {userId && <CreateBaseEvent />}
            </div>
          </TabsContent>
          <TabsContent value='settings'>
            <section className='w-fit flex flex-wrap gap-4 justify-center pb-12 px-4'>
              <MemberEditForm className='w-full xl:w-auto' />
              <LeagueSettings />
              <h2 className='text-4xl leading-loose shadow-lg font-bold text-primary-foreground text-center w-full bg-primary rounded-lg'>
                League Scoring
              </h2>
              <LeagueScoring />
              <CustomEvents />
            </section>
          </TabsContent>
          <ScrollBar hidden orientation='vertical' />
        </ScrollArea>
      </Tabs>
    </main >
  );
}
