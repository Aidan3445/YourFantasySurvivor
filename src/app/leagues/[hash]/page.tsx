import MemberEditForm from '~/components/leagues/customization/member/view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/common/tabs';
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
import SetSurvivalCap from '~/components/leagues/customization/settings/cap/view';
import ShauhinMode from '~/components/leagues/customization/settings/shauhin/view';
import getLeague from '~/services/leagues/query/legaue';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import DeleteLeague from '~/components/leagues/actions/league/delete/view';
import ManageMembers from '~/components/leagues/actions/league/members/view';
import { getSeasonData } from '~/services/seasons/query/seasonsData';
import LeagueTimeline from '~/components/leagues/hub/activity/leagueTimeline/view';
import Scores from '~/components/leagues/hub/shared/scores/view';

export default async function LeaguePage({ params }: LeaguePageProps) {
  const { hash } = await params;
  const auth = await leagueMemberAuth(hash);
  const { userId } = await systemAdminAuth();
  let isActive = false;
  let league = null;
  let seasonData = null;
  if (auth.memberId) {
    league = await getLeague(auth as VerifiedLeagueMemberAuth);
    isActive = league?.status === 'Active';
    if (league) {
      seasonData = await getSeasonData(league.seasonId);
    }
  }

  return (
    <Tabs className='w-full' defaultValue='scores'>
      <TabsList className='sticky flex w-full px-10 rounded-none z-50 *:flex-1 [&>*:last-child]:flex-none [&>*:last-child]:w-fit bg-accent'>
        <TabsTrigger value='scores'>Scores</TabsTrigger>
        {isActive && auth.role !== 'Member' && <TabsTrigger value='events'>Commish</TabsTrigger>}
        {isActive && userId && <TabsTrigger value='Base'>Base</TabsTrigger>}
        <TabsTrigger value='settings'>Settings</TabsTrigger>
      </TabsList>
      <ScrollArea className='overflow-y-visible px-4 md:h-[calc(100svh-10.5rem)] h-[calc(100svh-9rem-var(--navbar-height))]'>
        <div className='pb-4'>
          <TabsContent className='space-y-4' value='scores'>
            <Scores isActive={isActive} />
            <ChangeCastaway />
            <Predictions />
            {seasonData && <LeagueTimeline seasonData={seasonData} />}
          </TabsContent>
          <TabsContent value='events'>
            <CreateCustomEvent />
          </TabsContent>
          <TabsContent value='Base'>
            <CreateBaseEvent />
          </TabsContent>
          <TabsContent value='settings' className='space-y-4'>
            {!isActive && <>
              <MemberEditForm className='flex-1' />
              <div className='w-full flex flex-wrap gap-4 justify-center'>
                <div className='flex flex-col gap-4 w-full lg:w-1/2 lg:max-w-lg'>
                  <LeagueSettings />
                  <DeleteLeague />
                </div>
                <ManageMembers />
              </div>
              <div className='w-full flex items-center gap-2 justify-center p-2 bg-card rounded-lg shadow-md shadow-primary/10 border-2 border-primary/20'>
                <span className='h-5 w-0.5 bg-primary rounded-full' />
                <h2 className='text-2xl font-black uppercase tracking-tight text-center'>
                  Scoring
                </h2>
                <span className='h-5 w-0.5 bg-primary rounded-full' />
              </div>
            </>}
            <SetSurvivalCap />
            <LeagueScoring />
            <ShauhinMode />
            <CustomEvents />
          </TabsContent>
        </div>
        <ScrollBar className='pb-4 pt-2' />
      </ScrollArea >
    </Tabs >
  );
}
