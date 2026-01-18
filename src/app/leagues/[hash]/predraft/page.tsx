import CustomEvents from '~/components/leagues/customization/events/custom/view';
import LeagueSettings from '~/components/leagues/customization/settings/league/view';
import MemberEditForm from '~/components/leagues/customization/member/view';
import { DraftCountdown } from '~/components/leagues/predraft/countdown/view';
import DraftOrder from '~/components/leagues/predraft/order/view';
import InviteLink from '~/components/leagues/predraft/inviteLink/view';
import LeagueScoring from '~/components/leagues/customization/events/base/view';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/common/tabs';
import ShauhinMode from '~/components/leagues/customization/settings/shauhin/view';
import DeleteLeague from '~/components/leagues/actions/league/delete/view';
import ManageMembers from '~/components/leagues/actions/league/members/view';
import SurvivalSettings from '~/components/leagues/customization/settings/survival/view';

export default async function PredraftPage() {

  return (
    <Tabs className='w-full' defaultValue='draft'>
      <TabsList className='sticky flex w-full px-10 rounded-none z-50 bg-accent'>
        <TabsTrigger className='flex-1' value='draft'>League</TabsTrigger>
        <TabsTrigger className='flex-none w-fit' value='settings'>Settings</TabsTrigger>
      </TabsList>
      <ScrollArea className='overflow-y-visible px-4 md:h-[calc(100svh-10.5rem)] h-[calc(100svh-9rem-var(--navbar-height))]'>
        <div className='pb-4'>
          <TabsContent value='draft' className='space-y-4'>
            <InviteLink />
            <DraftCountdown className='p-4 pt-2' />
            <DraftOrder className='' />
            <div className='w-full flex items-center gap-2 justify-center p-2 bg-card rounded-lg shadow-md shadow-primary/10 border-2 border-primary/20'>
              <span className='h-5 w-0.5 bg-primary rounded-full' />
              <h2 className='text-2xl font-black uppercase tracking-tight text-center'>
                League Scoring
              </h2>
              <span className='h-5 w-0.5 bg-primary rounded-full' />
            </div>
            <SurvivalSettings />
            <LeagueScoring />
            <ShauhinMode />
            <CustomEvents />
          </TabsContent>
          <TabsContent value='settings' className='space-y-4'>
            <MemberEditForm />
            <div className='w-full flex flex-wrap gap-4 justify-center'>
              <div className='flex flex-col gap-4 w-full'>
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
