import CustomEvents from '~/components/leagues/customization/customEvents';
import { LeagueSettings } from '~/components/leagues/customization/leagueSettings';
import MemberEditForm from '~/components/leagues/customization/memberEdit';
import { DraftCountdown } from '~/components/leagues/draftCountdown';
import DraftOrder from '~/components/leagues/draftOrder';
import InviteLink from '~/components/leagues/inviteLink';
import LeagueScoring from '~/components/leagues/leagueScoring';
import { ScrollArea, ScrollBar } from '~/components/ui/scrollArea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';

export default async function LeaguePage() {
  return (
    <main className='flex flex-col gap-0 w-full'>
      {/*<div className='xl:grid xl:grid-cols-3 gap-4 px-4'>*/}
      <div className='p-4 pb-0'>
        <Tabs
          className='col-span-2 w-full bg-secondary rounded-3xl border h-[calc(100vh-4rem)] max-md:h-[calc(100vh-6.5rem)] overflow-hidden'
          defaultValue='draft'>
          <TabsList className='sticky z-50 top-0 grid grid-flow-col auto-cols-fr w-full px-10 rounded-b-none'>
            <TabsTrigger value='draft'>Draft</TabsTrigger>
            <TabsTrigger value='settings'>Settings</TabsTrigger>
          </TabsList>
          <ScrollArea className='h-full w-full'>
            <TabsContent value='draft'>
              <div className='flex flex-col gap-4 items-center w-full px-4 pb-12'>
                <InviteLink />
                <DraftCountdown />
                <DraftOrder />
                <LeagueScoring />
                <CustomEvents />
              </div>
            </TabsContent>
            <TabsContent
              value='settings'>
              <section className='w-fit grid lg:grid-cols-2 gap-4 justify-center'>
                <MemberEditForm />
                <LeagueSettings />
              </section>
            </TabsContent>
            <ScrollBar orientation='vertical' />
          </ScrollArea>
        </Tabs>
        {/*<section className='w-full h-[calc(100vh-4rem)] p-4 bg-secondary rounded-3xl border flex flex-col'>
          <h2 className='text-lg font-bold text-center'>League Chat</h2>
          <div className='flex flex-col gap-2 overflow-y-auto flex-1'>YO</div>
        </section>*/}
      </div>
    </main >
  );
}
