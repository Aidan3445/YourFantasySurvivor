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
    <main className='flex flex-col gap-0 w-full md:p-4 pb-0 md:h-auto'>
      <Tabs
        className='w-full md:bg-secondary rounded-3xl md:border md:h-[calc(100svh-4rem)] md:overflow-hidden'
        defaultValue='draft'>
        <TabsList className='sticky top-10 md:static grid grid-flow-col auto-cols-fr w-full px-10 rounded-none z-50'>
          <TabsTrigger value='draft'>Draft</TabsTrigger>
          <TabsTrigger value='settings'>Settings</TabsTrigger>
        </TabsList>
        <ScrollArea className='h-full'>
          <TabsContent value='draft'>
            <div className='flex flex-col gap-4 w-full px-4 md:pb-12'>
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
            <section className='w-fit flex flex-wrap gap-4 justify-center px-4 md:pb-12'>
              <MemberEditForm className='w-full' />
              <LeagueSettings />
            </section>
          </TabsContent>
          <ScrollBar hidden orientation='vertical' />
        </ScrollArea>
      </Tabs>
    </main >
  );
}
