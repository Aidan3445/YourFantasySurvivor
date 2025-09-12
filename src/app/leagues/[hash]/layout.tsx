import { SignIn } from '@clerk/nextjs';
import { type ReactNode } from 'react';
import LeagueHeader from '~/components/leagues/layout/leagueHeader';
import { leagueMemberAuth } from '~/lib/auth';

export interface LeaguePageProps {
  params: Promise<{
    hash: string;
  }>;
}

export interface LeagueLayoutProps extends LeaguePageProps {
  children: ReactNode;
}

export default async function LeagueLayout({ children, params }: LeagueLayoutProps) {
  const { hash } = await params;
  const { memberId } = await leagueMemberAuth(hash);

  if (!memberId) {
    return (
      <main className='w-full place-items-center flex flex-col justify-center h-screen gap-4'>
        <h1 className='text-3xl'>Sign in to view the League</h1>
        <SignIn routing='hash' forceRedirectUrl={`/leagues/${hash}`} />
      </main>
    );
  }

  return (
    <div className='w-full'>
      <LeagueHeader />
      {children}
    </div>
  );
}
