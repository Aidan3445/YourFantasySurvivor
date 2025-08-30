import { type NextRequest, NextResponse } from 'next/server';
import { type LeaguePageProps } from '~/app/leagues/[leagueHash]/layout';
import { leaguesService as QUERIES } from '~/services/leagues';

export async function GET(_: NextRequest, { params }: LeaguePageProps) {
  const { leagueHash } = await params;
  try {
    const draft = await QUERIES.getDraft(leagueHash);
    return NextResponse.json(draft, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

