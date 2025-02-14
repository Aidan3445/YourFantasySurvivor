import DraftCastaways from '~/components/leagues/draft/draftCastaways';
import DraftOrder from '~/components/leagues/draftOrder';
import LeagueRouter from '~/components/leagues/leagueRouter';
import { type LeagueRouteProps } from '../layout';
import DraftTracker from '~/components/leagues/draft/draftTracker';

export default async function DraftPage({ params }: LeagueRouteProps) {
  const { leagueHash } = await params;

  return (
    <main className='w-full flex flex-col gap-4 items-center px-8'>
      <LeagueRouter currentRoute='draft' />
      <h1 className='text-3xl my-4'>Welcome to the Draft!</h1>
      <DraftOrder />
      <DraftTracker leagueHash={leagueHash} />
      <DraftCastaways leagueHash={leagueHash} />
    </main>
  );
}
