import { type NextRequest, NextResponse } from 'next/server';
import getLeagueName from '~/services/leagues/query/name';
import type { LeagueRouteParams } from '~/types/api';

export async function GET(
  _: NextRequest,
  { params }: LeagueRouteParams
) {
  const { hash } = await params;

  try {
    const leagueName = await getLeagueName(hash);
    if (!leagueName) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 });
    }
    return NextResponse.json({ leagueName }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
