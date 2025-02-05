import { redirect } from 'next/navigation';
import { type ReactNode } from 'react';
import { QUERIES } from '~/app/api/leagues/query';
import LeagueProvider from '~/context/leagueContext';
import { leagueMemberAuth } from '~/lib/auth';

interface LeagueLayoutProps {
  children: ReactNode;
  params: Promise<{
    leagueHash: string;
  }>;
}

export default async function LeagueLayout({ children, params }: LeagueLayoutProps) {
  const { leagueHash } = await params;

  const leagueResponse = await QUERIES.getLeague(leagueHash);
  if (!leagueResponse) return <div>League not found</div>;

  const { memberId } = await leagueMemberAuth(leagueResponse.league.leagueId);
  if (!memberId) {
    redirect('/leagues');
  }

  return (
    <LeagueProvider league={leagueResponse}>
      {children}
    </LeagueProvider>
  );
}
