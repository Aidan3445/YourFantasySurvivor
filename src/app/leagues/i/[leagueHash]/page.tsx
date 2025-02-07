import JoinLeagueForm from '~/components/leagues/joinLeague';
import { leagueMemberAuth } from '~/lib/auth';
import { type LeaguePageProps } from '../../[leagueHash]/page';
import { SignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default async function LeagueJoinPage({ params }: LeaguePageProps) {
  const { leagueHash } = await params;
  const { userId, memberId } = await leagueMemberAuth(leagueHash);

  if (!userId) {
    return (
      <main className='w-full'>
        <h1 className='text-3xl'>Sign in to join the League</h1>
        <SignIn fallbackRedirectUrl={`/leagues/i/${leagueHash}`} />
      </main>
    );
  }

  if (memberId) {
    redirect(`/leagues/${leagueHash}`);
  }

  return (
    <main className='w-full'>
      <h1 className='text-3xl'>Join the League</h1>
      <JoinLeagueForm leagueHash={leagueHash} />
    </main>
  );
}
