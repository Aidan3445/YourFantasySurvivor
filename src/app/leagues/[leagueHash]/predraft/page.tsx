import { leaguesService as QUERIES } from '~/services/leagues';
import CustomEvents from '~/components/leagues/customization/customEvents';
import { LeagueSettings } from '~/components/leagues/customization/leagueSettings';
import MemberEditForm from '~/components/leagues/customization/memberEdit';
import SetSurvivalCap from '~/components/leagues/customization/setSurvivalCap';
import { DraftCountdown } from '~/components/leagues/predraft/countdown/view';
import DraftOrder from '~/components/leagues/predraft/order/view';
import InviteLink from '~/components/leagues/predraft/inviteLink';
import LeagueScoring from '~/components/leagues/customization/leagueScoring';
import LeagueChatCard from '~/components/leagues/chat/card';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/common/tabs';
import { type LeaguePageProps } from '~/app/leagues/[leagueHash]/layout';
import ShauhinMode from '~/components/leagues/customization/shauhinMode';

export default async function LeaguePage({ params }: LeaguePageProps) {
  const { leagueHash } = await params;
  const chatHistory = await QUERIES.getChatHistory(leagueHash);

  return (
    <main className='flex gap-6 md:w-[calc(100svw-var(--sidebar-width))] md:p-2 pb-0 md:h-auto'>
      <Tabs
        className='w-full pb-2 shadow-lg md:bg-secondary rounded-3xl md:border md:h-[calc(100svh-5rem)] md:overflow-hidden'
        defaultValue='draft'>
        <TabsList className='sticky top-10 md:static grid grid-flow-col auto-cols-fr w-full px-10 rounded-none z-50'>
          <TabsTrigger value='draft'>Draft</TabsTrigger>
          <TabsTrigger value='settings'>Settings</TabsTrigger>
        </TabsList>
        <ScrollArea className='md:h-full h-[calc(100svh-7.5rem)] overflow-y-visible'>
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
              <ShauhinMode />
            </div>
          </TabsContent>
          <TabsContent
            className='mt-0'
            value='settings'>
            <section className='w-fit flex flex-wrap gap-4 justify-center px-4 md:pb-12'>
              <MemberEditForm className='w-full' />
              <LeagueSettings />
            </section>
          </TabsContent>
          <ScrollBar orientation='vertical' />
        </ScrollArea>
      </Tabs>
      <LeagueChatCard chatHistory={chatHistory} />
    </main >
  );
}
