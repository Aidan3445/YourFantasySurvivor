import { SignUp } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { type ReactNode } from 'react';
import { QUERIES } from '~/app/api/leagues/query';
import LeagueHeader from '~/components/leagues/leagueHeader';
import LeagueProvider from '~/context/leagueContext';

export interface LeagueRouteProps {
  params: Promise<{
    leagueHash: string;
  }>;
}

export interface LeagueLayoutProps extends LeagueRouteProps {
  children: ReactNode;
}

export default async function LeagueLayout({ children, params }: LeagueLayoutProps) {
  const { leagueHash } = await params;

  let leagueResponse;
  try {
    leagueResponse = await QUERIES.getLeague(leagueHash);
  } catch {
    return (
      <main className='w-full'>
        <h1 className='text-3xl'>Sign in to view the League</h1>
        <SignUp forceRedirectUrl={`/leagues/${leagueHash}`} />
      </main>
    );
  }

  if (!leagueResponse) redirect('/leagues/new');

  return (
    <LeagueProvider league={leagueResponse}>
      <div className='w-full'>
        <LeagueHeader />
        {children}
      </div>
    </LeagueProvider>
  );
}
