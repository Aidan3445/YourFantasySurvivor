import { type NextRequest, NextResponse } from 'next/server';
import { type LeaguePageProps } from '~/app/leagues/[leagueHash]/layout';
import { QUERIES } from '~/app/api/leagues/query';

export async function GET(_: NextRequest, { params }: LeaguePageProps) {
  const { leagueHash } = await params;
  try {
    const leaguePromise = QUERIES.getLeague(leagueHash);
    const leagueDataPromise = QUERIES.getLeagueLiveData(leagueHash);

    const [league, leagueData] = await Promise.all([leaguePromise, leagueDataPromise]);

    return NextResponse.json({ league, leagueData }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

