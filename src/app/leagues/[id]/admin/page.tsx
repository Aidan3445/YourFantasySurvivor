import { auth } from '@clerk/nextjs/server';
import { and, eq, or } from 'drizzle-orm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/app/_components/commonUI/tabs';
import { getDraftDetails } from '~/app/api/leagues/[id]/draft/query';
import { getRules } from '~/app/api/leagues/[id]/rules/query';
import { getBaseEvents, getCustomEvents, getWeeklyEvents } from '~/app/api/leagues/[id]/score/query';
import { sysAuth } from '~/app/api/system/query';
import { db } from '~/server/db';
import { leagueMembers } from '~/server/db/schema/members';
import NewCustomEvent from './_components/newCustom';

interface AdminPageProps {
  params: {
    id: string;
  };
}

export default async function Admin({ params }: AdminPageProps) {
  const leagueId = parseInt(params.id);
  const { userId } = auth();
  if (!userId) throw new Error('Not authenticated');

  const { isOwner } = await db
    .select({ isOwner: leagueMembers.isOwner })
    .from(leagueMembers).where(and(
      eq(leagueMembers.league, leagueId),
      eq(leagueMembers.userId, userId),
      or(eq(leagueMembers.isAdmin, true), eq(leagueMembers.isOwner, true))))
    .then((members) => {
      if (members.length === 0) throw new Error('Not authorized');
      return members[0]!;
    });

  const sys = await sysAuth();

  const [
    rules, events, { league, castaways, tribes, remaining },
    customEvents, weeklyEvents, seasonEvents
  ] =
    await Promise.all([
      getRules(leagueId), sys ? getBaseEvents(leagueId) : null, getDraftDetails(leagueId),
      isOwner ? getCustomEvents(leagueId) : null,
      isOwner ? getWeeklyEvents(leagueId) : null,
      isOwner ? getWeeklyEvents(leagueId) : null,
    ]);

  // temp hide error
  events; weeklyEvents; seasonEvents;

  return (
    <main className='flex flex-col gap-0 text-center' >
      <h1 className='text-2xl font-semibold'>ADMIN</h1>
      <Tabs defaultValue='custom'>
        <TabsList>
          {sys && <TabsTrigger value='base'>Base</TabsTrigger>}
          <TabsTrigger value='custom'>Custom</TabsTrigger>
          <TabsTrigger value='weekly'>Weekly</TabsTrigger>
          <TabsTrigger value='season'>Season</TabsTrigger>
        </TabsList>
        {sys && <TabsContent value='base'>
          <div>Base</div>
        </TabsContent>}
        <TabsContent value='custom'>
          <NewCustomEvent
            rules={rules.custom}
            events={customEvents}
            leagueId={leagueId}
            castaways={castaways}
            tribes={tribes}
            members={league.members}
            remaining={remaining} />
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

