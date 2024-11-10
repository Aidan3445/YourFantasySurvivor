import { getLeague } from '~/app/api/leagues/query';
import LeagueDetails from './_components/leagueDetails';
import LeagueScoring from './_components/events/leagueScoring';
import DraftInfo from './_components/settings/draftInfo';
import { Leaderboard } from './_components/scores/leaderboard';
import { cn } from '~/lib/utils';
import { Timeline } from './_components/events/timeline/timeline';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function League({ params }: PageProps) {
  const leagueId = parseInt(params.id);
  const { league, members, isFull } = await getLeague(leagueId);

  const ownerLoggedIn = members.some((member) => member.isOwner && member.loggedIn);
  const adminLoggedIn = members.some((member) => member.isAdmin && member.loggedIn);

  return (
    <main className='flex flex-col gap-0 text-center' >
      <h1 className='text-4xl font-semibold mb-2'>{league?.name}</h1>
      <span className='grid grid-cols-2 gap-2 mb-2 grid-rows-2'>
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
      <Leaderboard
        leagueId={leagueId}
        members={members}
        ownerLoggedIn={ownerLoggedIn}
        isFull={isFull} />
      <Timeline leagueId={leagueId} />
    </main >
  );
}

