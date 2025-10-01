import MemberEditForm from '~/components/leagues/customization/member/view';
import Chart from '~/components/leagues/hub/chart/view';
import Timeline from '~/components/leagues/hub/activity/timeline/view';
import Scoreboard from '~/components/leagues/hub/scoreboard/view';
import { DynamicTabs, TabsContent, TabsList, TabsTrigger } from '~/components/common/tabs';
import { leagueMemberAuth, systemAdminAuth } from '~/lib/auth';
import { type LeaguePageProps } from '~/app/leagues/[hash]/layout';
import ChangeCastaway from '~/components/leagues/hub/picks/changeSurvivor/view';
import CreateBaseEvent from '~/components/leagues/actions/events/base/create';
import CustomEvents from '~/components/leagues/customization/events/custom/view';
import LeagueSettings from '~/components/leagues/customization/settings/league/view';
import LeagueScoring from '~/components/leagues/customization/events/base/view';
import CreateCustomEvent from '~/components/leagues/actions/events/custom/create';
import Predictions from '~/components/leagues/hub/picks/predictions/view';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
//import LeagueChatCard from '~/components/leagues/main/leagueChatCard';
//import { leaguesService as QUERIES } from '~/services/leagues';
import SetSurvivalCap from '~/components/leagues/customization/settings/cap/view';
import ShauhinMode from '~/components/leagues/customization/settings/shauhin/view';
import getLeague from '~/services/leagues/query/legaue';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import DeleteLeague from '~/components/leagues/actions/league/delete/view';

export default async function LeaguePage({ params }: LeaguePageProps) {
  const { hash } = await params;
  const auth = await leagueMemberAuth(hash);
  const { userId } = await systemAdminAuth();
  let isActive = false;
  if (auth.memberId) {
    const league = await getLeague(auth as VerifiedLeagueMemberAuth);
    isActive = league?.status === 'Active';
  }
  //const chatHistory = await QUERIES.getChatHistory(hash);

  return (
    <main className='flex gap-6 md:w-[calc(100svw-var(--sidebar-width))] md:p-2 pb-0 md:h-auto'>
      <DynamicTabs
        className='w-full shadow-lg md:bg-secondary rounded-3xl md:border md:h-[calc(100svh-5rem)] md:overflow-hidden'
        defaultValue='scores'
        rules={[
          //{ tabName: 'chat', maxWidth: '1024px' }
        ]} >
        <TabsList className='sticky top-10 md:static flex w-full px-10 rounded-none z-50'>
          <TabsTrigger className='flex-1' value='scores'>Scores</TabsTrigger>
          {/*
          <TabsTrigger className='flex-1 lg:hidden' value='chat'>Chat</TabsTrigger>
          */}
          {isActive && auth.role !== 'Member' && <TabsTrigger className='flex-1' value='events'>Commish</TabsTrigger>}
          {isActive && userId && <TabsTrigger className='flex-1' value='Base'>Base</TabsTrigger>}
          <TabsTrigger className='flex-0 ml-10' value='settings'>Settings</TabsTrigger>
        </TabsList>
        <ScrollArea className='md:h-full h-[calc(100svh-7.5rem)] overflow-y-clip @container/tabs-content'>
          <TabsContent className='mb-2' value='scores'>
            <section className='w-fit flex flex-wrap gap-4 justify-center px-4 md:pb-12 pb-2'>
              <span className='w-full grid grid-cols-1 grid-rows-2 lg:grid-cols-2 lg:grid-rows-1 gap-4 items-center justify-center overflow-x-clip'>
                <Scoreboard />
                <Chart />
              </span>
              <ChangeCastaway />
              <Predictions />
              <Timeline />
            </section>
          </TabsContent>
          {/*
          <TabsContent value='chat' className='m-2 mt-0'>
            <LeagueChatCard className='w-full px-2 h-[calc(100svh-8.5rem)]' chatHistory={chatHistory} defaultOpen />
          </TabsContent>
          */}
          <TabsContent value='events'>
            <CreateCustomEvent />
          </TabsContent>
          <TabsContent value='Base'>
            <CreateBaseEvent />
          </TabsContent>
          <TabsContent value='settings'>
            <section className='w-fit flex flex-wrap gap-4 justify-center px-4 md:pb-14'>
              {isActive && <>
                <h2 className='text-4xl leading-loose shadow-lg font-bold text-primary-foreground text-center w-full bg-primary rounded-lg'>
                  Settings
                </h2>
                <MemberEditForm className='flex-1' />
                <span className='w-full flex flex-wrap gap-4 justify-center'>
                  <LeagueSettings />
                  <DeleteLeague />
                </span>
              </>}
              <h2 className='text-4xl leading-loose shadow-lg font-bold text-primary-foreground text-center w-full bg-primary rounded-lg'>
                Scoring
              </h2>
              <SetSurvivalCap />
              <LeagueScoring />
              <ShauhinMode />
              <CustomEvents />
            </section>
          </TabsContent>
          <ScrollBar orientation='vertical' className='invisible md:visible' />
        </ScrollArea>
      </DynamicTabs>
      {/*
      <LeagueChatCard className='hidden lg:block' chatHistory={chatHistory} />
      */}
    </main >
  );
}
