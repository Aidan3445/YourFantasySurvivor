import CustomEvents from '~/components/leagues/customization/customEvents';
import { LeagueSettings } from '~/components/leagues/customization/leagueSettings';
import MemberEditForm from '~/components/leagues/customization/memberEdit';
import SetSurvivalCap from '~/components/leagues/customization/setSurvivalCap';
import { DraftCountdown } from '~/components/leagues/draftCountdown';
import DraftOrder from '~/components/leagues/draftOrder';
import InviteLink from '~/components/leagues/inviteLink';
import LeagueScoring from '~/components/leagues/leagueScoring';
import { ScrollArea, ScrollBar } from '~/components/ui/scrollArea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';

export default async function LeaguePage() {
  return (
    <main className='flex flex-col gap-0 w-full p-4 pb-0'>
      <Tabs
        className='col-span-2 w-full bg-secondary rounded-3xl border h-[calc(100svh-4rem)] max-md:h-[calc(100svh-6.5rem)] overflow-hidden'
        defaultValue='draft'>
        <TabsList className='top-0 grid grid-flow-col auto-cols-fr w-full px-10 rounded-b-none'>
          <TabsTrigger value='draft'>Draft</TabsTrigger>
          <TabsTrigger value='settings'>Settings</TabsTrigger>
        </TabsList>
        <ScrollArea className='h-full'>
          <TabsContent value='draft'>
            <div className='flex flex-col gap-4 w-full px-4 pb-12'>
              <InviteLink />
              <DraftCountdown />
              <DraftOrder />
              <h2 className='text-4xl leading-loose shadow-lg font-bold text-primary-foreground text-center w-full bg-primary rounded-lg'>
                League Scoring
              </h2>
              <SetSurvivalCap />
              <LeagueScoring />
              <CustomEvents />
            </div>
          </TabsContent>
          <TabsContent
            value='settings'>
            <section className='w-fit flex flex-wrap gap-4 justify-center pb-12'>
              <MemberEditForm />
              <LeagueSettings />
            </section>
          </TabsContent>
          <ScrollBar hidden orientation='vertical' />
        </ScrollArea>
      </Tabs>
    </main >
  );
}
