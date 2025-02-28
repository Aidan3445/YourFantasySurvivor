import DraftCastaways from '~/components/leagues/draft/draftCastaways';
import { type LeaguePageProps } from '~/app/leagues/[leagueHash]/layout';
import DraftTracker from '~/components/leagues/draft/draftTracker';

export default async function DraftPage({ params }: LeaguePageProps) {
  const { leagueHash } = await params;

  return (
    <main className='flex flex-col items-center px-8'>
      <h1 className='text-3xl leading-none h-min p-0'>Welcome to the Draft!</h1>
      <DraftTracker leagueHash={leagueHash} />
      <br />
      <DraftCastaways leagueHash={leagueHash} />
    </main>
  );
}
