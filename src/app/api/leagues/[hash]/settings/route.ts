import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import { withLeagueMemberAuth } from '~/lib/apiMiddleware';
import getLeagueSettings from '~/services/leagues/query/settings';

export async function GET(_: NextRequest, context: LeagueRouteParams) {
  return withLeagueMemberAuth(async (auth) => {
    try {
      const leagueSettings = await getLeagueSettings(auth);
      if (!leagueSettings) {
        return NextResponse.json({ error: 'League not found' }, { status: 404 });
      }
      return NextResponse.json(leagueSettings, { status: 200 });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
  })(context);
}
