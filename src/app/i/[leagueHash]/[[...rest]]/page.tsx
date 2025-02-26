import JoinLeagueForm from '~/components/leagues/joinLeague';
import { type LeaguePageProps } from '~/app/leagues/[leagueHash]/layout';
import { SignIn, SignUp } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { leagueMemberAuth } from '~/lib/auth';
import { Button } from '~/components/ui/button';
import Link from 'next/link';

interface JoinPageProps extends LeaguePageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LeagueJoinPage({ searchParams, params }: JoinPageProps) {
  const [{ leagueHash }, query] = await Promise.all([params, searchParams]);
  const { userId, memberId, league } = await leagueMemberAuth(leagueHash);

  if (!userId) {
    return (
      <main className='w-full flex justify-center mt-2'>
        {query?.SignUp ?
          <SignUp forceRedirectUrl={`/i/${leagueHash}`} signInUrl={`/i/${leagueHash}`} /> :
          <SignIn forceRedirectUrl={`/i/${leagueHash}`} signUpUrl={`/i/${leagueHash}?SignUp=true`} />
        }
      </main>
    );
  }

  if (memberId) {
    redirect(`/leagues/${leagueHash}`);
  }

  if (league && league.leagueStatus !== 'Predraft') {
    return (
      <main className='w-full place-items-center'>
        <h1 className='text-3xl'>Sorry, {league.leagueName} is no longer accepting members!</h1>
        <p>{'You can\'t join this league because it has already started.'}</p>
        <Link href='/'>
          <Button>Back to Home</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className='w-full place-items-center mt-4'>
      <h1 className='text-3xl'>Join the League</h1>
      <JoinLeagueForm leagueHash={leagueHash} />
    </main>
  );
}
