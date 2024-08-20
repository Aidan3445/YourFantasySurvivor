import { getLeague } from '~/app/api/leagues/query';
import Members from './_components/members';
import LeagueDetails from './_components/leagueDetails';
import LeagueScoring from './_components/events/leagueScoring';

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
    <main className='flex flex-col gap-0 text-center'>
      <h1 className='text-2xl font-semibold'>{league?.name}</h1>
      <h3 className='text-md font-semibold'>Season: {league?.season}</h3>
      <span className='grid grid-cols-2'>
        <LeagueDetails className='m-2 text-black' league={league} ownerLoggedIn={ownerLoggedIn} />
        <LeagueScoring className='m-2 text-black' league={league} ownerLoggedIn={ownerLoggedIn} />
      </span>
      <Members
        leagueId={leagueId}
        members={members}
        ownerLoggedIn={ownerLoggedIn}
        isFull={isFull} />
    </main>
  );
}

