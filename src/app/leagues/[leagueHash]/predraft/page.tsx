import { LeagueSettingsTabContent, LeagueSettingsTabTrigger } from '~/components/leagues/customization/leagueSettings';
import MemberEditForm from '~/components/leagues/customization/memberEdit';
import { DraftCountdown } from '~/components/leagues/draftCountdown';
import DraftOrder from '~/components/leagues/draftOrder';
import InviteLink from '~/components/leagues/inviteLink';
import LeagueHeader from '~/components/leagues/leagueHeader';
import LeagueScoring from '~/components/leagues/leagueScoring';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';

export default async function LeaguePage() {
  return (
    <main className='flex flex-col gap-0 w-full h-screen'>
      <LeagueHeader />
      <div className='grid grid-cols-3 gap-4 w-full h-full p-4 overflow-hidden'>
        <Tabs
          className='col-span-2 w-full bg-secondary rounded-3xl border h-[calc(100vh-4rem)] overflow-clip'
          defaultValue='draft'>
          <TabsList className='grid grid-flow-col auto-cols-fr w-full px-10 rounded-b-none'>
            <TabsTrigger value='draft'>Draft Settings</TabsTrigger>
            <TabsTrigger value='member'>Member Settings</TabsTrigger>
            <LeagueSettingsTabTrigger />
          </TabsList>
          <section className='flex flex-col items-center h-full gap-4 px-4 pb-14 pt-2 mt-0 light-scroll'>
            <TabsContent value='draft'>
              <div className='flex flex-col gap-4 items-center w-full'>
                <InviteLink />
                <DraftCountdown />
                <DraftOrder />
                <LeagueScoring />
              </div>
            </TabsContent>
            <TabsContent value='member'>
              <MemberEditForm />
            </TabsContent>
            <LeagueSettingsTabContent />
          </section>
        </Tabs>

        <section className='w-full h-[calc(100vh-4rem)] p-4 bg-secondary rounded-3xl border flex flex-col'>
          <h2 className='text-lg font-bold text-center'>League Chat</h2>
          <div className='flex flex-col gap-2 overflow-y-auto flex-1'>YO</div>
        </section>
      </div>
    </main>
  );
}
