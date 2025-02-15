import { type NextRequest, NextResponse } from 'next/server';
import { type LeaguePageProps } from '~/app/leagues/[leagueHash]/layout';
import { QUERIES } from '../query';

export async function GET(_: NextRequest, { params }: LeaguePageProps) {
  const { leagueHash } = await params;
  try {
    const league = await QUERIES.getLeague(leagueHash);
    return NextResponse.json(league, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

