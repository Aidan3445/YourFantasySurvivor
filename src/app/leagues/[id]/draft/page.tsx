import { redirect } from 'next/navigation';
import DraftOrder from '../_components/settings/draftOrder';
import { getLeagueSettings } from '~/app/api/leagues/[id]/settings/query';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function League({ params }: PageProps) {
  const leagueId = parseInt(params.id);
  const { draftOrder } = await getLeagueSettings(leagueId);

  //redirect(`/leagues/${leagueId}/`);

  return (
    <main>
      <h1 className='text-3xl font-semibold'>League Draft</h1>
      <article className='grid grid-cols-3 gap-10'>
        <section className='sticky top-32 self-start'>
          <DraftOrder leagueId={leagueId} draftOrder={draftOrder} orderLocked />
        </section>
        <section className='col-span-2 items-stretch text-center'>
          {/* <section className='h-min light-scroll'>
          {preseasonPredictions.map((rule, index) => (
            <PredictionInfo key={index} prediction={rule} parity={index % 2 === 0} />
          ))}
        </section> */}
          DRAFT ENTRIES
        </section>
      </article>
    </main>
  );
}
