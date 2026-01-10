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
      <TabsList className='sticky grid grid-flow-col auto-cols-fr w-full px-10 rounded-none z-50'>
        <TabsTrigger value='draft'>Draft</TabsTrigger>
        <TabsTrigger value='settings'>Settings</TabsTrigger>
      </TabsList>
      <ScrollArea className='overflow-y-visible px-4 md:h-[calc(100svh-7rem)] h-[calc(100svh-6rem-var(--navbar-height))]'>
        <div className='pb-4'>
          <TabsContent value='draft' className='space-y-4'>
            <InviteLink />
            <DraftCountdown />
            <DraftOrder />
            <h2 className='text-4xl leading-loose shadow-lg font-bold text-primary-foreground text-center w-full bg-primary rounded-lg'>
              League Scoring
            </h2>
            <SetSurvivalCap />
            <LeagueScoring />
            <ShauhinMode />
            <CustomEvents />
          </TabsContent>
          <TabsContent value='settings' className='space-y-4'>
            <MemberEditForm className='w-full' />
            <span className='w-full flex flex-wrap gap-4 justify-center'>
              <span className='flex flex-col gap-4 w-full lg:w-1/2 lg:max-w-lg'>
                <LeagueSettings />
                <DeleteLeague />
              </span>
              <ManageMembers />
            </span>
          </TabsContent>
        </div>
        <ScrollBar className='pb-4 pt-2' />
      </ScrollArea>
    </Tabs>
  );
}
/*<LeagueChatCard chatHistory={chatHistory} />*/
