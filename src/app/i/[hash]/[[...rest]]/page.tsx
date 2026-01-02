import JoinLeagueForm from '~/components/leagues/actions/league/join/form';
import { type LeaguePageProps } from '~/app/leagues/[hash]/layout';
import { SignIn, SignUp } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { leagueMemberAuth } from '~/lib/auth';
import { Button } from '~/components/common/button';
import Link from 'next/link';
import type { Metadata } from 'next';
import { metadata } from '~/app/layout';
import getPublicLeague from '~/services/leagues/query/public';

interface JoinPageProps extends LeaguePageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata(
  { params }: JoinPageProps,
): Promise<Metadata> {
  // read route params
  const { hash } = await params;
  const { name } = await getPublicLeague(hash) ?? { name: 'a league' };


  return {
    ...metadata,
    openGraph: {
      title: `Join ${name} on YFS`,
      description: 'You\'ve bee invited to join a league on Your Fantasy Survivor!',
      images: ['https://i.imgur.com/xS6JQdr.png'],
    }
  };
}

export default async function LeagueJoinPage({ searchParams, params }: JoinPageProps) {
  const [{ hash }, query] = await Promise.all([params, searchParams]);
  const { userId, memberId } = await leagueMemberAuth(hash);
  const { name, status, season, usedColors } = await getPublicLeague(hash) ?? {};

  if (!userId) {
    return (
      <main className='w-full flex justify-center mt-2'>
        {query?.signUp ?
          <SignUp forceRedirectUrl={`/i/${hash}`} signInUrl={`/i/${hash}`} /> :
          <SignIn forceRedirectUrl={`/i/${hash}`} signUpUrl={`/i/${hash}?signUp=true`} />
        }
      </main>
    );
  }

  if (memberId) {
    redirect(`/leagues/${hash}`);
  }

  if (!name || !status || !season || !usedColors) {
    return (
      <main className='w-full flex justify-center mt-2'>
        <h1 className='text-3xl'>League Not Found</h1>
        <p>{'The league you are trying to join does not exist. Please check the link and try again.'}</p>
        <Link href='/'>
          <Button>Back to Home</Button>
        </Link>
      </main>
    );
  }

  if (status !== 'Predraft') {
    return (
      <main className='w-full flex justify-center mt-2'>
        <h1 className='text-3xl'>Sorry, {name} is no longer accepting members!</h1>
        <p>{'You can\'t join this league because it has already started.'}</p>
        <Link href='/'>
          <Button>Back to Home</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className='w-full flex flex-col items-center justify-center mt-2'>
      <h1 className='text-3xl'>Join {name}</h1>
      <JoinLeagueForm hash={hash} colors={usedColors} />
    </main>
  );
}
