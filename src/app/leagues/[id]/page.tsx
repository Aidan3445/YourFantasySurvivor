import { getLeague } from '~/app/api/leagues/query';
import Members from './_components/members';
import { DeleteLeague } from './_components/memberEdit';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function League({ params }: PageProps) {
  const leagueId = parseInt(params.id);
  const { league, members } = await getLeague(leagueId);

  const ownerLoggedIn = members.some((member) => member.isOwner && member.loggedIn);

  return (
    <main className='flex flex-col text-center'>
      <div className='flex gap-3'>
        <h1 className='text-2xl font-semibold'>{league?.name}</h1>
        {ownerLoggedIn && <DeleteLeague leagueId={leagueId} />}
      </div>
      <h3 className='text-lg font-semibold'>{league?.season}</h3>
      <Members leagueId={leagueId} members={members} />
    </main>
  );
}

