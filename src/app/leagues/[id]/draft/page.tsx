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
  const { league, settings, seasonRules, castaways, tribes } = await getDraftDetails(leagueId);

  const preseasonPredictions = seasonRules
    .filter((rule) => rule.timing === 'premiere')
    .reduce((preds, rule) => {
      if (!preds[rule.referenceType]) preds[rule.referenceType] = [];
      preds[rule.referenceType]!.push(rule);
      return preds;
    }, {
      leagueId, pickCount: settings.pickCount,
      currentPicks: await getCurrentPredictions(leagueId, seasonRules),
      picks: {
        castaways,
        tribes,
        members: league.members,
      }
    } as DraftFormProps);

  //redirect(`/leagues/${leagueId}/`);

  return (
    <main>
      <h1 className='text-3xl font-semibold'>League Draft</h1>
      <article className='grid grid-cols-3 gap-10'>
        <section className='sticky top-32 self-start flex flex-col justify-center'>
          <h3 className='text-xl font-semibold text-center'>Draft Order</h3>
          <DraftOrder leagueId={leagueId} draftOrder={settings.draftOrder} orderLocked />
        </section>
        <DraftForm className='col-span-2 items-stretch text-center' {...preseasonPredictions} />
      </article>
    </main>
  );
}
