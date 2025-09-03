import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import { withLeagueAuth } from '~/lib/api-middleware';
import getPredictionTimings from '~/services/leagues/query/predictionTimings';

export async function GET(request: NextRequest, context: LeagueRouteParams) {
  return withLeagueAuth(async (_, context, __) => {
    const { hash } = await context.params;
    try {
      const predictionTimings = getPredictionTimings(hash);
      return NextResponse.json({ predictionTimings }, { status: 200 });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
  })(request, context);
}
