import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import { withLeagueMemberAuth } from '~/lib/apiMiddleware';
import playShotInTheDarkLogic from '~/services/leagues/mutation/useShotInTheDark';
import cancelShotInTheDarkLogic from '~/services/leagues/mutation/cancelShotInTheDark';

export async function POST(_: NextRequest, context: LeagueRouteParams) {
  return withLeagueMemberAuth(async (auth) => {
    try {
      const status = await playShotInTheDarkLogic(auth);
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

export async function DELETE(_: NextRequest, context: LeagueRouteParams) {
  return withLeagueMemberAuth(async (auth) => {
    try {
      const status = await cancelShotInTheDarkLogic(auth);
      return NextResponse.json(status, { status: 200 });
    } catch (e) {
      console.error('Failed to cancel shot in the dark', e);
      return NextResponse.json(
        { error: 'An error occurred while cancelling the shot in the dark. Please try again.' },
        { status: 500 }
      );
    }
  })(context);
}

