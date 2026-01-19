import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import { withLeagueMemberAuth } from '~/lib/apiMiddleware';
import makeSecondaryPickLogic from '~/services/leagues/mutation/makeSecondaryPick';

export async function POST(request: NextRequest, context: LeagueRouteParams) {
  return withLeagueMemberAuth(async (auth) => {
    try {
      const body = await request.json() as {
        castawayId: number;
      };

      const status = await makeSecondaryPickLogic(auth, body.castawayId,);
      return NextResponse.json(status, { status: 200 });
    } catch (e) {
      console.error('Failed to make prediction', e);
      return NextResponse.json(
        { error: 'An error occurred while making the prediction. Please try again.' },
        { status: 500 }
      );
    }
  })(context);
}
