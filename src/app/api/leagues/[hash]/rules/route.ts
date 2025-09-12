import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import { withLeagueMemberAuth } from '~/lib/apiMiddleware';
import getLeagueRules from '~/services/leagues/query/rules';

export async function GET(_: NextRequest, context: LeagueRouteParams) {
  return withLeagueMemberAuth(async (auth) => {
    try {
      const leagueRules = await getLeagueRules(auth);
      if (!leagueRules) {
        return NextResponse.json({ error: 'League not found' }, { status: 404 });
      }
      return NextResponse.json(leagueRules, { status: 200 });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: 'Failed to fetch league rules' }, { status: 500 });
    }
  })(context);
}
