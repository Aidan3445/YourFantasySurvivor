import JoinLeagueForm from '~/components/leagues/actions/league/join/form';
import { type LeaguePageProps } from '~/app/leagues/[hash]/layout';
import { SignIn, SignUp } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { leagueMemberAuth } from '~/lib/auth';
import { Button } from '~/components/common/button';
import Link from 'next/link';
import type { Metadata } from 'next';
import getPublicLeague from '~/services/leagues/query/public';
import LeagueHeader from '~/components/leagues/layout/leagueHeader';

interface JoinPageProps extends LeaguePageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata(
  { params }: JoinPageProps,
): Promise<Metadata> {
  const { hash } = await params;
  const league = await getPublicLeague(hash);

  if (!league) {
    return {
      title: 'Invalid Invite - Trial by Fire',
    };
  }

  return {
    title: `Join ${league.name} - Trial by Fire`,
    description: `You've been invited to join ${league.name} (${league.season}) on Trial by Fire!`,
  };
}

export default async function LeagueJoinPage({ searchParams, params }: JoinPageProps) {
  const [{ hash }, query] = await Promise.all([params, searchParams]);
  const { userId, memberId } = await leagueMemberAuth(hash);
  const league = await getPublicLeague(hash, userId);
  const { status, usedColors, isProtected } = league ?? {};

  if (!userId) {
    return (
      <div className='h-[calc(100svh-1rem)]'>
        <LeagueHeader league={league} mode={{ isProtected: league?.isProtected ?? false }} />
        <div className='flex flex-col items-center justify-center gap-4 p-8'>
          <div className='bg-card rounded-lg shadow-md shadow-primary/10 border-2 border-primary/20 p-6 max-w-md text-center space-y-4'>
            <p className='text-muted-foreground text-base'>
              Sign in or create an account to join this league
            </p>
            {query?.signUp ?
              <SignUp forceRedirectUrl={`/i/${hash}`} signInUrl={`/i/${hash}`} /> :
              <SignIn forceRedirectUrl={`/i/${hash}`} signUpUrl={`/i/${hash}?signUp = true`} />
            }
          </div>
        </div>
      </div>
    );
  }

  if (memberId || league?.isPending) {
    redirect(`/leagues/${hash}`);
  }

  if (!league) {
    return (
      <div className='h-[calc(100svh-1rem)]'>
        <div className='sticky z-50 flex flex-col w-full justify-center bg-card shadow-lg shadow-primary/20 px-4 py-4 items-center border-b-2 border-primary/20'>
          <span className='flex items-center justify-center gap-3'>
            <span className='h-6 w-1 bg-primary rounded-full' />
            <h1 className='text-3xl md:text-4xl font-black uppercase tracking-tight text-center'>League Not Found</h1>
            <span className='h-6 w-1 bg-primary rounded-full' />
          </span>
        </div>
        <div className='flex flex-col items-center justify-center gap-4 p-8'>
          <div className='bg-card rounded-lg shadow-md shadow-primary/10 border-2 border-primary/20 p-6 max-w-md text-center space-y-4'>
            <p className='text-muted-foreground text-base'>
              The league you are trying to join does not exist. Please check the link and try again.
            </p>
            <Link href='/'>
              <Button className='w-full'>Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status !== 'Predraft') {
    return (
      <div className='h-[calc(100svh-1rem)]'>
        <LeagueHeader league={league} />
        <div className='flex flex-col items-center justify-center gap-4 p-8'>
          <div className='bg-card rounded-lg shadow-md shadow-primary/10 border-2 border-primary/20 p-6 max-w-md text-center space-y-4'>
            <h2 className='text-xl font-bold'>Sorry, this league is no longer accepting members!</h2>
            <p className='text-muted-foreground text-base'>
              You can&apos;t join this league because it has already started.
            </p>
            <Link href='/'>
              <Button className='w-full'>Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='h-[calc(100svh-1rem)]'>
      <LeagueHeader league={league} mode={{ isProtected: isProtected ?? false }} />
      <div className='flex flex-col items-center justify-center gap-4 p-4 md:p-8'>
        <JoinLeagueForm hash={hash} colors={usedColors ?? []} isProtected={isProtected ?? false} />
      </div>
    </div>
  );
}
