import { getLeague } from '~/app/api/leagues/query';

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
      <div className='flex flex-col gap-3'>
        {members.map((member) => {
          return (
            <div
              key={member.userId}
              className='px-4 rounded border border-black'
              style={{ background: member.color }}>{member.displayName}</div>
          );
        })}
      </div>
    </main>
  );

}
