import { type NextRequest, NextResponse } from 'next/server';
import { type LeaguePageProps } from '~/app/leagues/[leagueHash]/layout';
import { QUERIES } from '~/app/api/leagues/query';

export async function GET(_: NextRequest, { params }: LeaguePageProps) {
  const { leagueHash } = await params;
  try {
    const leaguePromise = QUERIES.getLeague(leagueHash);
    const leagueScoresPromise = QUERIES.getBaseEventScores(leagueHash);

    const [league, leagueScores] = await Promise.all([leaguePromise, leagueScoresPromise]);

    return NextResponse.json({ league, leagueScores }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

