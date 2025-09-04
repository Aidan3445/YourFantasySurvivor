import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import { withLeagueMemberAuth } from '~/lib/apiMiddleware';
import getPredictionTimings from '~/services/leagues/query/predictionTimings';

export async function GET(_: NextRequest, context: LeagueRouteParams) {
  return withLeagueMemberAuth(async (auth) => {
    try {
      const predictionTimings = getPredictionTimings(auth);
      return NextResponse.json({ predictionTimings }, { status: 200 });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
  })(context);
}
