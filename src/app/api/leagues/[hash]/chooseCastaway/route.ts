import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import chooseCastawayLogic from '~/services/leagues/mutation/chooseCastaway';
import { withLeagueMemberAuth } from '~/lib/apiMiddleware';

export async function POST(request: NextRequest, context: LeagueRouteParams) {
  return withLeagueMemberAuth(async (auth) => {
    const body = await request.json() as {
      castawayId: number;
    };

    if (!body.castawayId) {
      return NextResponse.json({ error: 'castawayId is required' }, { status: 400 });
    }

    try {
      const success = await chooseCastawayLogic(auth, body.castawayId);
      return NextResponse.json(success, { status: 200 });
    } catch (e) {
      console.error('Failed to choose castaway', e);
      return NextResponse.json({ error: 'Failed to choose castaway' }, { status: 500 });
    }
  })(context);
}
