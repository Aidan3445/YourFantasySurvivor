import { getLeague } from '~/app/api/leagues/query';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function League({ params }: PageProps) {
  const { league, members } = await getLeague(parseInt(params.id));

  return (
    <section className='text-center flex flex-col'>
      <h1 className='font-semibold text-2xl'>{league?.name}</h1>
      <h3 className='font-semibold text-lg'>{league?.season}</h3>
      <div className='flex flex-col gap-3'>
        {members.map((member) => (
          <div key={member.userId}>{member.displayName}</div>
        ))}
      </div>
    </section>
  );
}
