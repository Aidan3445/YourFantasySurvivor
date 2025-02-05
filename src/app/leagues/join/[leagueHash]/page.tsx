import { QUERIES } from '~/app/api/leagues/query';
import { type LeaguePageProps } from '../../[leagueHash]/page';
import { redirect } from 'next/navigation';
import { SignIn } from '@clerk/nextjs';
import JoinLeagueForm from '~/components/leagues/joinLeague';
import { auth } from '@clerk/nextjs/server';

export default async function LeagueJoinPage({ params }: LeaguePageProps) {
  const { leagueHash } = await params;

  const { userId } = await auth();
  if (!userId) return <SignIn fallbackRedirectUrl={`/leagues/join/${leagueHash}`} />;

  // Check if the league exists
  try {
    const leagueResponse = await QUERIES.getLeague(leagueHash);
    if (leagueResponse) redirect(`/leagues/${leagueHash}`);
  } catch {
    redirect('/leagues');
  }

  return (
    <main className='w-full'>
      <h1 className='text-3xl'>Join a League</h1>
      <JoinLeagueForm leagueHash={leagueHash} />
    </main>
  );
}
