import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import { withLeagueAuth } from '~/lib/api-middleware';
import getLeagueRules from '~/services/leagues/query/rules';

export async function GET(request: NextRequest, context: LeagueRouteParams) {
  return withLeagueAuth(async (_, context, __) => {
    const { hash } = await context.params;
    try {
      const leagueRules = await getLeagueRules(hash);
      if (!leagueRules) {
        return NextResponse.json({ error: 'League not found' }, { status: 404 });
      }
      return NextResponse.json({ leagueRules }, { status: 200 });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
  })(request, context);
}
