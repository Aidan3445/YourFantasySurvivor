import JoinLeagueForm from '~/components/leagues/joinLeague';
import { type LeaguePageProps } from '~/app/leagues/[leagueHash]/layout';
import { SignUp } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { leagueMemberAuth } from '~/lib/auth';
import { Button } from '~/components/ui/button';
import Link from 'next/link';

export default async function LeagueJoinPage({ params }: LeaguePageProps) {
  const { leagueHash } = await params;
  const { userId, memberId, league } = await leagueMemberAuth(leagueHash);

  if (!userId) {
    return (
      <main className='w-full'>
        <h1 className='text-3xl'>Sign in to join the League</h1>
        <SignUp forceRedirectUrl={`/i/${leagueHash}`} />
      </main>
    );
  }

  if (memberId) {
    redirect(`/leagues/${leagueHash}`);
  }

  if (league && league.leagueStatus !== 'Predraft') {
    return (
      <main className='w-full'>
        <h1 className='text-3xl'>Sorry, {league.leagueName} is no longer accepting members!</h1>
        <p>{'You can\'t join this league because it has already started.'}</p>
        <Link href='/'>
          <Button>Back to Home</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className='w-full'>
      <h1 className='text-3xl'>Join the League</h1>
      <JoinLeagueForm leagueHash={leagueHash} />
    </main>
  );
}
