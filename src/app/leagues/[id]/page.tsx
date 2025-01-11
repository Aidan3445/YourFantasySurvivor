import { getLeague } from '~/app/api/leagues/query';
import LeagueDetails from './_components/leagueDetails';
import LeagueScoring from './_components/events/leagueScoring';
import DraftInfo from './_components/settings/draftInfo';
import { LeaderboardTabs, LeaderboardTabsSkeleton } from './_components/scores/leaderboard';
import { cn } from '~/lib/utils';
import { Timeline, TimelineSkeleton } from './_components/events/timeline/timeline';
import { Suspense } from 'react';
import { Tabs } from '~/app/_components/commonUI/tabs';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function League(props: PageProps) {
  const params = await props.params;
  const leagueId = parseInt(params.id);
  const { league, members, isFull } = await getLeague(leagueId);

  const ownerLoggedIn = members.some((member) => member.isOwner && member.loggedIn);
  const adminLoggedIn = members.some((member) => member.isAdmin && member.loggedIn);

  return (
    <main className='flex flex-col gap-0 text-center' >
      <h1 className='mb-2 text-4xl font-semibold'>{league?.name}</h1>
      <span className='grid grid-cols-2 grid-rows-2 gap-1 mb-2'>
        <LeagueDetails className='text-black' league={league} ownerLoggedIn={ownerLoggedIn} />
        <LeagueScoring
          className='text-black'
          league={league}
          ownerLoggedIn={ownerLoggedIn}
          openDefault={ownerLoggedIn && members.length === 1} />
        <DraftInfo
          className={cn('text-black px-1', !(ownerLoggedIn || adminLoggedIn) && 'col-span-2')}
          league={league}
          ownerLoggedIn={ownerLoggedIn} />
        {(ownerLoggedIn || adminLoggedIn) &&
          <a className='flex justify-center items-center text-base font-normal rounded-md hs-in' href={`/leagues/${leagueId}/admin`}>
            Admin
          </a>}
      </span>
      <Tabs defaultValue='members' className='flex flex-col items-center'>
        <Suspense fallback={<LeaderboardTabsSkeleton />}>
          <LeaderboardTabs
            leagueId={leagueId}
            members={members}
            ownerLoggedIn={ownerLoggedIn}
            isFull={isFull} />
        </Suspense>
      </Tabs>
      <Suspense fallback={<TimelineSkeleton />}>
        <Timeline leagueId={leagueId} />
      </Suspense>
    </main >
  );
}

