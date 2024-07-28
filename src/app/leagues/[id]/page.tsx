import { getLeague } from '~/app/api/leagues/query';
import Members from './_components/members';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function League({ params }: PageProps) {
  const { league, members } = await getLeague(parseInt(params.id));

  return (
    <main className='flex flex-col text-center'>
      <h1 className='text-2xl font-semibold'>{league?.name}</h1>
      <h3 className='text-lg font-semibold'>{league?.season}</h3>
      <Members members={members} />
    </main>
  );
}

