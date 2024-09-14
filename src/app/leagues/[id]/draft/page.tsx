//import { redirect } from 'next/navigation';
import DraftOrder from '../_components/settings/draftOrder';
import { getLeagueSettings } from '~/app/api/leagues/[id]/settings/query';
import { getRules } from '~/app/api/leagues/[id]/rules/query';
import DraftForm, { type DraftFormProps } from './_components/draftForm';
import { getCastaways } from '~/app/api/seasons/[name]/castaways/query';
import { getLeague } from '~/app/api/leagues/query';
import { getTribes } from '~/app/api/seasons/[name]/tribes/query';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function League({ params }: PageProps) {
  const leagueId = parseInt(params.id);
  const [{ draftOrder, pickCount }, { season }, castaways, tribes, { members }] = await Promise.all([
    getLeagueSettings(leagueId),
    getRules(leagueId),
    getCastaways('Test Season'),
    getTribes('Test Season'),
    getLeague(leagueId)
  ]);

  //if (settings.draftOver) return null;

  const preseasonPredictions = season
    .filter((rule) => rule.timing === 'premiere')
    .reduce((preds, rule) => {
      if (!preds[rule.referenceType]) preds[rule.referenceType] = [];
      preds[rule.referenceType]!.push(rule);
      return preds;
    }, {
      leagueId, pickCount, picks: {
        castaways,
        tribes,
        members
      }
    } as DraftFormProps);

  //redirect(`/leagues/${leagueId}/`);

  return (
    <main>
      <h1 className='text-3xl font-semibold'>League Draft</h1>
      <article className='grid grid-cols-3 gap-10'>
        <section className='sticky top-32 self-start flex flex-col justify-center'>
          <h3 className='text-xl font-semibold text-center'>Draft Order</h3>
          <DraftOrder leagueId={leagueId} draftOrder={draftOrder} orderLocked />
        </section>
        <DraftForm className='col-span-2 items-stretch text-center' {...preseasonPredictions} />
      </article>
    </main>
  );
}
