import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/app/_components/commonUI/tabs';
import { getDraftDetails } from '~/app/api/leagues/[id]/draft/query';
import { getRules } from '~/app/api/leagues/[id]/rules/query';
import { getBaseEvents, getCustomEvents, getEpisodes, getWeeklyEvents } from '~/app/api/leagues/[id]/score/query';
import { sysAuth } from '~/app/api/system/query';
import NewCustomEvent from './_components/newCustom';
import { isOwner } from '~/app/api/leagues/[id]/settings/query';
import NewBaseEvent from './_components/newBase';
import { EventQueue } from './_components/eventsQueue';

interface AdminPageProps {
  params: {
    id: string;
  };
}

export default async function Admin({ params }: AdminPageProps) {
  const leagueId = parseInt(params.id);
  const { userId, sys } = await sysAuth();
  if (!userId) throw new Error('Not authenticated');

  const owner = await isOwner(leagueId, userId);

  const [
    rules, events, { league, castaways, tribes, remaining },
    customEvents, weeklyEvents, seasonEvents, episodes,
  ] =
    await Promise.all([
      getRules(leagueId), sys ? getBaseEvents(leagueId) : null, getDraftDetails(leagueId),
      owner ? getCustomEvents(leagueId) : null,
      owner ? getWeeklyEvents(leagueId) : null,
      owner ? getWeeklyEvents(leagueId) : null,
      getEpisodes(leagueId),
    ]);

  // temp hide error
  events; weeklyEvents; seasonEvents;

  if (episodes.length === 0) throw new Error('No episodes found');

  return (
    <main className='flex flex-col gap-0 text-center' >
      <h1 className='text-2xl font-semibold'>ADMIN</h1>
      <a href={`/leagues/${leagueId}`} className='hs-in rounded-md text-black p-1 px-6 m-1'>Back</a>
      <Tabs defaultValue={sys ? 'base' : 'custom'}>
        <TabsList>
          {sys && <TabsTrigger value='base'>Base</TabsTrigger>}
          <TabsTrigger value='custom'>Custom</TabsTrigger>
          <TabsTrigger value='weekly'>Weekly</TabsTrigger>
          <TabsTrigger value='season'>Season</TabsTrigger>
        </TabsList>
        {sys && <TabsContent value='base'>
          <EventQueue>
            <NewBaseEvent
              castaways={castaways}
              tribes={tribes}
              remaining={remaining}
              episodes={episodes as [{ id: number, title: string, number: number, airDate: string }]}
              events={events} />
          </EventQueue>
        </TabsContent>}
        <TabsContent value='custom'>
          <NewCustomEvent
            rules={rules.custom}
            events={customEvents}
            leagueId={leagueId}
            castaways={castaways}
            tribes={tribes}
            members={league.members}
            remaining={remaining}
            episodes={episodes as [{ id: number, title: string, number: number, airDate: string }]} />
        </TabsContent>
        <TabsContent value='weekly'>
          <div>Weekly</div>
        </TabsContent>
        <TabsContent value='season'>
          <div>Season</div>
        </TabsContent>
      </Tabs>
      <br />
    </main >
  );
}
