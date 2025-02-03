import { type Member } from '~/server/db/schema/members';
import Members, { MembersSkeleton } from './membersScores';
import { TabsContent, TabsList, TabsTrigger } from '~/app/_components/commonUI/tabs';
import { getRules } from '~/app/api/leagues/[id]/events/query';
import { getSelectionUpdates, getCustomEvents, getBaseEvents, getWeeklyEvents, getSeasonEvents, getMemberEpisodeEvents } from '~/app/api/leagues/[id]/score/query';
import { scoreCastaways, scoreMembers } from '~/app/api/leagues/[id]/score/compile';
import Chart from '~/app/playground/_components/scoreChart';
import { getDraftDetails } from '~/app/api/leagues/[id]/draft/query';
import VotePredict from '../events/votePredict';
import { Skeleton } from '~/app/_components/commonUI/skeleton';
import Castaways, { CastawaysSkeleton } from './castawayScores';
import { getHslIndex } from '~/lib/utils';

interface MembersProps {
  leagueId: number;
  members: Member[];
  ownerLoggedIn: boolean;
  isFull: boolean;
}

export async function LeaderboardTabs({ leagueId, members, ownerLoggedIn, isFull }: MembersProps) {
  const [
    rules, events, customEvents, weeklyEvents, seasonEvents,
    { memberCastaways, castawayMembers }, details, episodeEvents,
  ] = await Promise.all([
    getRules(leagueId), getBaseEvents(leagueId),
    getCustomEvents(leagueId), getWeeklyEvents(leagueId), getSeasonEvents(leagueId),
    getSelectionUpdates(leagueId),
    getDraftDetails(leagueId), getMemberEpisodeEvents(leagueId),
  ]);

  const altEvents = {
    castawayEvents: [...customEvents.castawayEvents, ...weeklyEvents.castawayEvents, ...seasonEvents.castawayEvents],
    tribeEvents: [...customEvents.tribeEvents, ...weeklyEvents.tribeEvents, ...seasonEvents.tribeEvents],
    memberEvents: [...customEvents.memberEvents, ...weeklyEvents.memberEvents, ...seasonEvents.memberEvents],
  };

  const membersScores = scoreMembers(events, altEvents, rules, memberCastaways, castawayMembers);
  const membersWithScores = members.map((member) => {
    const points = membersScores[member.displayName] ?? [0, 0];
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
      if (a.episodeScores[i] !== b.episodeScores[i])
        return b.episodeScores[i]! - a.episodeScores[i]!;
    }
    return 0;
  });

  const castawaysScores = scoreCastaways(events, altEvents, rules);
  const castawaysWithScores = details.castaways.map((castaway) => {
    const points = castawaysScores[castaway.more.shortName] ?? [0, 0];
    return {
      ...castaway,
      points: points.reduce((a, b) => a + b, 0),
      episodeScores: points.reduce((totals, score, index) => {
        const last = totals.pop() ?? 0;
        for (let i = totals.length; i < index; i++) {
          totals.push(last);
        }
        totals.push(last + score);
        return totals;
      }, [] as number[]),
    };
  }).sort((a, b) => {
    // sort by last episode score, ties go to previous episode
    for (let i = a.episodeScores.length - 1; i >= 0; i--) {
      if (a.episodeScores[i] !== b.episodeScores[i])
        return b.episodeScores[i]! - a.episodeScores[i]!;
    }
    return 0;
  }).map((castaway, index) => ({
    ...castaway,
    color: getHslIndex(index, details.castaways.length / 2),
  }));

  return (
    <>
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
          {Object.keys(membersScores).length !== 0 &&
            <Chart className='w-96 min-h-60' data={membersWithScores} label />}
        </span>
      </TabsContent>
      <TabsContent value='castaways'>
        <span className='flex flex-wrap gap-4 justify-center w-full'>
          <Castaways castaways={castawaysWithScores} />
          {Object.keys(castawaysScores).length !== 0 &&
            <Chart className='w-96 h-[280px]' data={castawaysWithScores.slice(0, 9)} label />}
        </span>
      </TabsContent>
    </>
  );
}

export function LeaderboardTabsSkeleton() {
  return (
    <>
      <TabsList>
        <TabsTrigger value='members'>Members</TabsTrigger>
        <TabsTrigger value='castaways'>Castaways</TabsTrigger>
      </TabsList>
      <TabsContent value='members'>
        <span className='flex flex-wrap gap-4 justify-center w-full'>
          <MembersSkeleton />
          <Skeleton className='w-96 min-h-60' />
        </span>
      </TabsContent>
      <TabsContent value='castaways'>
        <span className='flex flex-wrap gap-4 justify-center w-full'>
          <CastawaysSkeleton />
          <Skeleton className='w-96 h-[280px]' />
        </span>
      </TabsContent>
    </>
  );
}
