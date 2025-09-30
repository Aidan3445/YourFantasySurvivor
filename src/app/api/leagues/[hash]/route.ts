import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import { withLeagueMemberAuth, withLeagueOwnerAuth } from '~/lib/apiMiddleware';
import getLeague from '~/services/leagues/query/legaue';
import deleteLeagueLogic from '~/services/leagues/mutation/deleteLeague';

export async function GET(_: NextRequest, context: LeagueRouteParams) {
  return withLeagueMemberAuth(async (auth) => {
    try {
      const league = await getLeague(auth);
      if (!league) {
        return NextResponse.json({ error: 'League not found' }, { status: 404 });
      }
      return NextResponse.json(league, { status: 200 });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: 'An error occurred while fetching the league.' }, { status: 500 });
    }
  })(context);
}

export async function DELETE(_: NextRequest, context: LeagueRouteParams) {
  return withLeagueOwnerAuth(async (auth) => {
    try {
      const success = await deleteLeagueLogic(auth);
      return NextResponse.json(success, { status: 200 });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: 'An error occurred while deleting the league.' }, { status: 500 });
    }
  })(context);
}
