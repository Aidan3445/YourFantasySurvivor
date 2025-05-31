import MemberEditForm from '~/components/leagues/customization/memberEdit';
import Chart from '~/components/leagues/main/chart';
import RecentActivity from '~/components/leagues/main/recentActivity';
import Scoreboard from '~/components/leagues/main/scoreboard';
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
import { ScrollArea, ScrollBar } from '~/components/ui/scrollArea';
import LeagueChat from '~/components/leagues/main/leagueChat';

export default async function LeaguePage({ params }: LeaguePageProps) {
  const { leagueHash } = await params;
  const { role } = await leagueMemberAuth(leagueHash);
  const { userId } = await systemAdminAuth();
  return (
    <main className='flex gap-6 md:w-[calc(100svw-var(--sidebar-width))] md:p-2 pb-0 md:h-auto'>
      <Tabs
        className='w-full shadow-lg md:bg-secondary rounded-3xl md:border md:h-[calc(100svh-5rem)] md:overflow-hidden'
        defaultValue='scores'>
        <TabsList className='sticky top-10 md:static flex w-full px-10 rounded-none z-50'>
          <TabsTrigger className='flex-1' value='scores'>Scores</TabsTrigger>
          {role !== 'Member' && <TabsTrigger className='flex-1' value='events'>Commish</TabsTrigger>}
          {userId && <TabsTrigger className='flex-1' value='Base'>Base</TabsTrigger>}
          <TabsTrigger className='flex-0 ml-10' value='settings'>Settings</TabsTrigger>
        </TabsList>
        <ScrollArea className='md:h-full h-[calc(100svh-7.5rem)] overflow-y-visible'>
          <TabsContent value='scores'>
            <section className='w-fit flex flex-wrap gap-4 justify-center px-4 md:pb-14'>
              <span className='w-full grid grid-cols-1 grid-rows-2 lg:grid-cols-2 md:grid-rows-1 gap-4 items-center justify-center overflow-x-auto'>
                <Scoreboard />
                <Chart />
              </span>
              <ChangeSurvivor />
              <Predictions leagueHash={leagueHash} />
              <RecentActivity />
            </section>
          </TabsContent>
          <TabsContent
            className='mt-0'
            value='events'>
            <CreateCustomEvent />
          </TabsContent>
          <TabsContent
            className='mt-0'
            value='Base'>
            <CreateBaseEvent />
          </TabsContent>
          <TabsContent
            className='mt-0'
            value='settings'>
            <section className='w-fit flex flex-wrap gap-4 justify-center px-4 md:pb-14'>
              <MemberEditForm className='w-full xl:w-auto' />
              <LeagueSettings />
              <h2 className='text-4xl leading-loose shadow-lg font-bold text-primary-foreground text-center w-full bg-primary rounded-lg'>
                League Scoring
              </h2>
              <LeagueScoring />
              <CustomEvents />
            </section>
          </TabsContent>
          <div className='h-2' />
          <ScrollBar orientation='vertical' />
        </ScrollArea>
      </Tabs>
      <LeagueChat />
    </main >
  );
}
