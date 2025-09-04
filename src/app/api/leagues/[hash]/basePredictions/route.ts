import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import { withLeagueMemberAuth } from '~/lib/apiMiddleware';
import getBasePredictions from '~/services/leagues/query/basePredictions';

export async function GET(_: NextRequest, context: LeagueRouteParams) {
  return withLeagueMemberAuth(async (auth) => {
    try {
      const basePredictions = await getBasePredictions(auth);
      return NextResponse.json({ basePredictions }, { status: 200 });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: 'Failed to fetch base predictions' }, { status: 500 });
    }
  })(context);
}
