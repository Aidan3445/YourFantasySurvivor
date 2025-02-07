import JoinLeagueForm from '~/components/leagues/joinLeague';
import { type LeaguePageProps } from '../../../[leagueHash]/page';
import { SignUp } from '@clerk/nextjs';
import { QUERIES } from '~/app/api/leagues/query';
import LeagueProvider from '~/context/leagueContext';
import { redirect } from 'next/navigation';

export default async function LeagueJoinPage({ params }: LeaguePageProps) {
  const { leagueHash } = await params;

  let leagueResponse;
  try {
    leagueResponse = await QUERIES.getLeagueJoin(leagueHash);
  } catch {
    return (
      <main className='w-full'>
        <h1 className='text-3xl'>Sign in to join the League</h1>
        <SignUp forceRedirectUrl={`/leagues/i/${leagueHash}`} />
      </main>
    );
  }


  if (!leagueResponse) {
    redirect(`/leagues/${leagueHash}`);
  }

  return (
    <LeagueProvider league={leagueResponse}>
      <main className='w-full'>
        <h1 className='text-3xl'>Join the League</h1>
        <JoinLeagueForm leagueHash={leagueHash} />
      </main>
    </LeagueProvider>
  );
}
