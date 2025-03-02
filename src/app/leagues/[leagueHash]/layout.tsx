import { SignUp } from '@clerk/nextjs';
import { type ReactNode } from 'react';
import LeagueHeader from '~/components/leagues/leagueHeader';
import { leagueMemberAuth } from '~/lib/auth';

export interface LeaguePageProps {
  params: Promise<{
    leagueHash: string;
  }>;
}

export interface LeagueLayoutProps extends LeaguePageProps {
  children: ReactNode;
}

export default async function LeagueLayout({ children, params }: LeagueLayoutProps) {
  const { leagueHash } = await params;
  const { memberId } = await leagueMemberAuth(leagueHash);

  if (!memberId) {
    return (
      <main className='w-full'>
        <h1 className='text-3xl'>Sign in to view the League</h1>
        <SignUp forceRedirectUrl={`/leagues/${leagueHash}`} />
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
