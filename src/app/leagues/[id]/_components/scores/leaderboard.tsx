import { type Member } from '~/server/db/schema/members';
import Members, { CastawaysSkeleton, MembersSkeleton } from './membersScores';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/app/_components/commonUI/tabs';
import { getRules } from '~/app/api/leagues/[id]/events/query';
import { getCastawayMemberEpisodeTable, getCustomEvents, getBaseEvents, getWeeklyEvents, getSeasonEvents, getMemberEpisodeEvents } from '~/app/api/leagues/[id]/score/query';
import compileScores from '~/app/api/leagues/[id]/score/compile';
import Chart from '~/app/playground/_components/scoreChart';
import { getDraftDetails } from '~/app/api/leagues/[id]/draft/query';
import VotePredict from '../events/votePredict';
import { Skeleton } from '~/app/_components/commonUI/skeleton';

interface MembersProps {
  leagueId: number;
  members: Member[];
  ownerLoggedIn: boolean;
  isFull: boolean;
}

export async function Leaderboard({ leagueId, members, ownerLoggedIn, isFull }: MembersProps) {
  const [
    rules, events, customEvents, weeklyEvents, seasonEvents,
    memberCastaways, details, episodeEvents,
  ] = await Promise.all([
    getRules(leagueId), getBaseEvents(leagueId),
    getCustomEvents(leagueId), getWeeklyEvents(leagueId), getSeasonEvents(leagueId),
    getCastawayMemberEpisodeTable(members.map((m) => m.id)),
    getDraftDetails(leagueId), getMemberEpisodeEvents(leagueId),
  ]);

  const altEvents = {
    castawayEvents: [...customEvents.castawayEvents, ...weeklyEvents.castawayEvents, ...seasonEvents.castawayEvents],
    tribeEvents: [...customEvents.tribeEvents, ...weeklyEvents.tribeEvents, ...seasonEvents.tribeEvents],
    memberEvents: [...customEvents.memberEvents, ...weeklyEvents.memberEvents, ...seasonEvents.memberEvents],
  };

  const baseScores = compileScores(events, altEvents, memberCastaways, rules);

  const membersWithScores = members.map((member) => {
    const points = baseScores[member.displayName] ?? [0, 0];
    return {
      ...member,
      points: points.reduce((a, b) => a + b, 0),
      episodeScores: points.reduce((totals, score, index) => {
        const last = totals.pop() ?? 0;
        for (let i = totals.length; i < index; i++) {
          totals.push(last);
        }
        totals.push(last + score);
        return totals;
      }, [] as number[]),
      name: member.displayName
    };
  }).sort((a, b) => {
    // sort by last episode score, ties go to previous episode
    for (let i = a.episodeScores.length - 1; i >= 0; i--) {
      return b.episodeScores[i]! - a.episodeScores[i]!;
    }
    return 0;
  });

  return (
    <Tabs defaultValue='members' className='flex flex-col items-center'>
      <section className='flex flex-col w-min'>
        <VotePredict
          leagueId={leagueId}
          events={episodeEvents}
          castaways={details.remaining}
          tribes={details.tribes}
          members={members} />
        <TabsList>
          <TabsTrigger value='members'>Members</TabsTrigger>
          <TabsTrigger value='castaways'>Castaways</TabsTrigger>
        </TabsList>
      </section>
      <TabsContent value='members'>
        <span className='flex flex-wrap gap-4 justify-center w-full'>
          <Members
            leagueId={leagueId}
            members={membersWithScores}
            ownerLoggedIn={ownerLoggedIn}
            isFull={isFull}
            details={details} />
          {Object.keys(baseScores).length !== 0 && <Chart className='w-96 min-h-60' data={membersWithScores} label />}
        </span>
      </TabsContent>
      <TabsContent value='castaways'>
        <h2>Castaways scoreboard</h2>
        <p>Coming soon</p>
        <span className='flex flex-wrap gap-4 justify-center mt-2 w-full'>
          <CastawaysSkeleton />
          <Skeleton className='w-96 h-[280px]' />
        </span>
      </TabsContent>
    </Tabs>
  );
}

export function LeaderboardSkeleton() {
  return (
    <section className='flex flex-col items-center'>
      <div className='flex flex-col gap-2 justify-center'>
        <Skeleton className='p-1 w-48 h-6' />
        <Skeleton className='p-1 w-48 h-10' />
      </div>
      <span className='flex flex-wrap gap-4 justify-center mt-2 w-full'>
        <MembersSkeleton />
        <Skeleton className='w-96 h-[280px]' />
      </span>
    </section>
  );
}
