import JoinLeagueForm from '~/components/leagues/actions/joinLeague';
import { type LeaguePageProps } from '~/app/leagues/[leagueHash]/layout';
import { SignIn, SignUp } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { leagueMemberAuth } from '~/lib/auth';
import { Button } from '~/components/common/button';
import Link from 'next/link';
import type { Metadata } from 'next';
import { leaguesService as QUERIES } from '~/services/leagues';
import { metadata } from '~/app/layout';

interface JoinPageProps extends LeaguePageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata(
  { params }: JoinPageProps,
): Promise<Metadata> {
  // read route params
  const { leagueHash } = await params;
  const leagueName = await QUERIES.getLeagueName(leagueHash) ?? 'Your Fantasy Survivor';


  return {
    ...metadata,
    openGraph: {
      title: `Join ${leagueName} on YFS`,
      description: 'You\'ve bee invited to join a league on Your Fantasy Survivor!',
      images: ['https://i.imgur.com/xS6JQdr.png'],
    }
  };
}

export default async function LeagueJoinPage({ searchParams, params }: JoinPageProps) {
  const [{ leagueHash }, query] = await Promise.all([params, searchParams]);
  const { userId, memberId, league } = await leagueMemberAuth(leagueHash);

  if (!userId) {
    return (
      <main className='w-full flex justify-center mt-2'>
        {query?.signUp ?
          <SignUp forceRedirectUrl={`/i/${leagueHash}`} signInUrl={`/i/${leagueHash}`} /> :
          <SignIn forceRedirectUrl={`/i/${leagueHash}`} signUpUrl={`/i/${leagueHash}?signUp=true`} />
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
