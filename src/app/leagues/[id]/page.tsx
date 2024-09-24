import { getLeague } from '~/app/api/leagues/query';
import LeagueDetails from './_components/leagueDetails';
import LeagueScoring from './_components/events/leagueScoring';
import DraftInfo from './_components/settings/draftInfo';
import { LeaderBoard } from './_components/scores/leaderboard';
import { cn } from '~/lib/utils';
import { Button } from '~/app/_components/commonUI/button';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function League({ params }: PageProps) {
  const leagueId = parseInt(params.id);
  const { league, members, isFull } = await getLeague(leagueId);

  const ownerLoggedIn = members.some((member) => member.isOwner && member.loggedIn);

  return (
    <main className='flex flex-col gap-0 text-center' >
      <h1 className='text-2xl font-semibold'>{league?.name}</h1>
      <br />
      <span className='grid grid-cols-2 gap-2 mb-2'>
        <LeagueDetails className='text-black' league={league} ownerLoggedIn={ownerLoggedIn} />
        <LeagueScoring
          className='text-black'
          league={league}
          ownerLoggedIn={ownerLoggedIn}
          openDefault={ownerLoggedIn && members.length === 1} />
        <DraftInfo className={cn('text-black', !ownerLoggedIn && 'col-span-2')} league={league} ownerLoggedIn={ownerLoggedIn} />
        <a href={`/leagues/${leagueId}/admin`}>
          <Button className='w-full hs-in p-1 rounded-md text-base font-normal'>Admin</Button>
        </a>
      </span>
      <LeaderBoard
        leagueId={leagueId}
        members={members}
        ownerLoggedIn={ownerLoggedIn}
        isFull={isFull} />
    </main >
  );
}

