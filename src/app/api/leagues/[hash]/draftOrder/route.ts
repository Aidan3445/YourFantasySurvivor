import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import updateDraftOrderLogic from '~/services/leagues/mutation/updateDraftOrder';
import { withLeagueAdminAuth } from '~/lib/apiMiddleware';

export async function PUT(request: NextRequest, context: LeagueRouteParams) {
  return await withLeagueAdminAuth(async (auth) => {
    const body = await request.json() as {
      draftOrder: number[]
    };

    if (!body.draftOrder) {
      return NextResponse.json({ error: 'Missing draftOrder in request body' }, { status: 400 });
    }

    try {
      const result = await updateDraftOrderLogic(auth, body.draftOrder);
      return NextResponse.json(result);
    } catch (e) {
      console.error('Failed to update draft order', e);
      return NextResponse.json({ error: 'An error occurred while updating the draft order.' }, { status: 500 });
    }
  })(context);
}
