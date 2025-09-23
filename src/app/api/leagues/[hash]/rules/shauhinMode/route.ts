import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import updateShauhinModeLogic from '~/services/leagues/mutation/updateShauhinMode';
import { type ShauhinModeSettings } from '~/types/leagues';
import { withLeagueAdminAuth } from '~/lib/apiMiddleware';

export async function PUT(request: NextRequest, context: LeagueRouteParams) {
  return await withLeagueAdminAuth(async (auth) => {
    const body = await request.json() as {
      shauhinMode: ShauhinModeSettings;
    };

    if (!body.shauhinMode) {
      return NextResponse.json({ error: 'Missing shauhinMode in request body' }, { status: 400 });
    }

    try {
      const success = await updateShauhinModeLogic(auth, body.shauhinMode);
      return NextResponse.json(success, { status: 200 });
    } catch (e) {
      console.error('Failed to update Shauhin Mode settings', e);
      return NextResponse.json({ error: 'An error occurred while updating the Shauhin Mode settings.' }, { status: 500 });
    }
  })(context);
}
