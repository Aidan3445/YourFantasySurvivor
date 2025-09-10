import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import { withLeagueMemberAuth } from '~/lib/apiMiddleware';
import { type PredictionInsert } from '~/types/events';
import makePredictionLogic from '~/services/leagues/mutation/makePrediction';

export async function POST(request: NextRequest, context: LeagueRouteParams) {
  return withLeagueMemberAuth(async (auth) => {
    try {
      const body = await request.json() as {
        prediction: PredictionInsert;
      };

      const status = await makePredictionLogic(auth, body.prediction);
      return NextResponse.json(status, { status: status.wasUpdate ? 200 : 201 });
    } catch (e) {
      console.error('Failed to make prediction', e);
      return NextResponse.json(
        { error: 'An error occurred while making the prediction. Please try again.' },
        { status: 500 }
      );
    }
  })(context);
}
