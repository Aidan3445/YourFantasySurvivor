import CustomEvents from '~/components/leagues/customization/events/custom/view';
import LeagueSettings from '~/components/leagues/customization/settings/league/view';
import MemberEditForm from '~/components/leagues/customization/member/view';
import SetSurvivalCap from '~/components/leagues/customization/settings/cap/view';
import { DraftCountdown } from '~/components/leagues/predraft/countdown/view';
import DraftOrder from '~/components/leagues/predraft/order/view';
import InviteLink from '~/components/leagues/predraft/inviteLink/view';
import LeagueScoring from '~/components/leagues/customization/events/base/view';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/common/tabs';
import ShauhinMode from '~/components/leagues/customization/settings/shauhin/view';
import DeleteLeague from '~/components/leagues/actions/league/delete/view';
import ManageMembers from '~/components/leagues/actions/league/members/view';

export default async function LeaguePage() {

  return (
    <Tabs className='w-full' defaultValue='draft'>
      <TabsList className='sticky flex w-full px-10 rounded-none z-50 *:flex-1 [&>*:last-child]:flex-none [&>*:last-child]:w-fit bg-accent'>
        <TabsTrigger value='draft'>League</TabsTrigger>
        <TabsTrigger value='settings'>Settings</TabsTrigger>
      </TabsList>
      <ScrollArea className='overflow-y-visible px-4 md:h-[calc(100svh-7.5rem)] h-[calc(100svh-6.5rem-var(--navbar-height))]'>
        <div className='pb-4'>
          <TabsContent value='draft' className='space-y-4'>
            <InviteLink />
            <DraftCountdown className='w-full bg-card' />
            <DraftOrder className='w-full bg-card' />
            <div className='flex items-center gap-2 justify-center p-2 bg-card rounded-lg shadow-md shadow-primary/10 border-2 border-primary/20'>
              <span className='h-5 w-0.5 bg-primary rounded-full' />
              <h2 className='text-2xl font-black uppercase tracking-tight text-center'>
                League Scoring
              </h2>
              <span className='h-5 w-0.5 bg-primary rounded-full' />
            </div>
            <SetSurvivalCap />
            <LeagueScoring />
            <ShauhinMode />
            <CustomEvents />
          </TabsContent>
          <TabsContent value='settings' className='space-y-4'>
            <MemberEditForm className='w-full' />
            <div className='w-full flex flex-wrap gap-4 justify-center'>
              <div className='flex flex-col gap-4 w-full lg:w-1/2 lg:max-w-lg'>
                <LeagueSettings />
                <DeleteLeague />
              </div>
              <ManageMembers />
            </div>
          </TabsContent>
        </div>
        <ScrollBar className='pb-4 pt-2' />
      </ScrollArea>
    </Tabs>
  );
}
/*<LeagueChatCard chatHistory={chatHistory} />*/
