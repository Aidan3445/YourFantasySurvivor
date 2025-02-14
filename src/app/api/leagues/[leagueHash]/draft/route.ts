import { type NextRequest, NextResponse } from 'next/server';
import { type LeagueRouteProps } from '~/app/leagues/[leagueHash]/layout';
import { QUERIES } from '../../query';

export async function GET(_: NextRequest, { params }: LeagueRouteProps) {
  const { leagueHash } = await params;
  try {
    const draft = await QUERIES.getDraft(leagueHash);
    return NextResponse.json(draft, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

