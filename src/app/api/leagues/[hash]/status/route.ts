import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import { withLeagueOwnerAuth } from '~/lib/apiMiddleware';
import updateLeagueStatusLogic from '~/services/leagues/mutation/updateLeagueStatus';

export async function PUT(_: NextRequest, context: LeagueRouteParams) {
  return withLeagueOwnerAuth(async (auth) => {
    try {
      const success = await updateLeagueStatusLogic(auth);
      return NextResponse.json(success, { status: 200 });
    } catch (e) {
      console.error('Failed to update league status', e);
      return NextResponse.json({ error: 'An error occurred while updating the league status.' }, { status: 500 });
    }
  })(context);
}

