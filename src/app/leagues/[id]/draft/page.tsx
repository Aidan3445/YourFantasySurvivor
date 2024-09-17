import DraftOrder from '../_components/settings/draftOrder';
import DraftForm, { type DraftFormProps } from './_components/draftForm';
import { getCurrentPredictions, getDraftDetails } from '~/app/api/leagues/[id]/draft/query';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function League({ params }: PageProps) {
  const leagueId = parseInt(params.id);
  const { league, settings, predictions, castaways, tribes, yourTurn } = await getDraftDetails(leagueId);

  const preseasonPredictions = {
    ...predictions,
    leagueId,
    pickCount: settings.pickCount,
    currentPicks: await getCurrentPredictions(
      leagueId, predictions.castaway, predictions.tribe, predictions.member),
    options: {
      castaways,
      tribes,
      members: league.members,
      unavailable: castaways.filter((c) => settings.draftOrder.some((d) => d.drafted === c.name)),
    },
    yourTurn
  } as DraftFormProps;

  return (
    <main>
      <h1 className='text-3xl font-semibold'>League Draft</h1>
      <article className='grid md:grid-cols-2 gap-10'>
        <section className='sticky top-32 self-start flex flex-col justify-center'>
          <h3 className='text-xl font-semibold text-center'>Draft Order</h3>
          <DraftOrder leagueId={leagueId} draftOrder={settings.draftOrder} orderLocked />
        </section>
        <DraftForm className='items-stretch text-center' {...preseasonPredictions} />
      </article>
    </main>
  );
}
