import JoinLeagueForm from '~/components/leagues/joinLeague';
import { type LeaguePageProps } from '../../../[leagueHash]/layout';
import { SignUp } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { leagueMemberAuth } from '~/lib/auth';

export default async function LeagueJoinPage({ params }: LeaguePageProps) {
  const { leagueHash } = await params;
  const { userId, memberId } = await leagueMemberAuth(leagueHash);

  if (!userId) {
    return (
      <main className='w-full'>
        <h1 className='text-3xl'>Sign in to join the League</h1>
        <SignUp forceRedirectUrl={`/leagues/i/${leagueHash}`} />
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
