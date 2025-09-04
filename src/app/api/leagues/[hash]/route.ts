import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import { withLeagueMemberAuth, withLeagueOwnerAuth } from '~/lib/apiMiddleware';
import getLeague from '~/services/leagues/query/legaue';
import { type LeagueSettingsUpdate } from '~/types/leagues';
import updateLeagueSettingsLogic from '~/services/leagues/mutation/updateLeagueSettings';

export async function GET(_: NextRequest, context: LeagueRouteParams) {
  return withLeagueMemberAuth(async (auth) => {
    try {
      const league = await getLeague(auth);
      if (!league) {
        return NextResponse.json({ error: 'League not found' }, { status: 404 });
      }
      return NextResponse.json({ league }, { status: 200 });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: 'An error occurred while fetching the league.' }, { status: 500 });
    }
  })(context);
}

export async function PUT(request: NextRequest, context: LeagueRouteParams) {
  return withLeagueOwnerAuth(async (auth) => {
    const body = await request.json() as LeagueSettingsUpdate;

    if (!body) {
      return NextResponse.json({ error: 'Missing league settings in request body' }, { status: 400 });
    }

    try {
      const { success } = await updateLeagueSettingsLogic(auth, body);
      return NextResponse.json({ success }, { status: 200 });
    } catch (e) {
      let message: string;
      if (e instanceof Error) message = e.message;
      else message = String(e);

      if (message.includes('User not') || message.includes('Not a league member')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      console.error('Failed to update league settings', e);
      return NextResponse.json({ error: 'An error occurred while updating the league settings.' }, { status: 500 });
    }
  })(context);
}
