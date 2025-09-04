import { type NextRequest, NextResponse } from 'next/server';
import getUsedColors from '~/services/leagues/query/colors';
import type { LeagueRouteParams } from '~/types/api';

export async function GET(_: NextRequest, { params }: LeagueRouteParams) {
  const { hash } = await params;

  try {
    const usedColors = getUsedColors(hash);
    return NextResponse.json({ usedColors }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch used colors' }, { status: 500 });
  }
}
