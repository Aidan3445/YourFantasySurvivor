import { type NextRequest, NextResponse } from 'next/server';
import { type LeaguePageProps } from '~/app/leagues/[leagueHash]/layout';
import { leagueMemberAuth } from '~/lib/auth';

export async function GET(_: NextRequest, { params }: LeaguePageProps) {
  const { leagueHash } = await params;
  const { memberId, league } = await leagueMemberAuth(leagueHash);

  if (!memberId || !league) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ leagueStatus: league.leagueStatus });
}

