import { getLeague } from '~/app/api/leagues/query';
import LeagueDetails from './_components/leagueDetails';
import LeagueScoring from './_components/events/leagueScoring';
import DraftInfo from './_components/settings/draftInfo';
import { Leaderboard, LeaderboardSkeleton } from './_components/scores/leaderboard';
import { cn } from '~/lib/utils';
import { Timeline, TimelineSkeleton } from './_components/events/timeline/timeline';
import { Suspense } from 'react';

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
      <h1 className='text-4xl font-semibold mb-2'>{league?.name}</h1>
      <span className='grid grid-cols-2 gap-1 mb-2 grid-rows-2'>
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
          <a className='hs-in rounded-md text-base font-normal flex justify-center items-center' href={`/leagues/${leagueId}/admin`}>
            Admin
          </a>}
      </span>
      <Suspense fallback={<LeaderboardSkeleton />}>
        <Leaderboard
          leagueId={leagueId}
          members={members}
          ownerLoggedIn={ownerLoggedIn}
          isFull={isFull} />
      </Suspense>
      <Suspense fallback={<TimelineSkeleton />}>
        <Timeline leagueId={leagueId} />
      </Suspense>
    </main >
  );
}

