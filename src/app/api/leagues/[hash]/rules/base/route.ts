import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import updateBaseEventRulesLogic from '~/services/leagues/mutation/updateBaseEventRules';
import { type BaseEventPredictionRules, type BaseEventRules } from '~/types/leagues';
import { withLeagueAdminAuth } from '~/lib/apiMiddleware';

export async function PUT(request: NextRequest, context: LeagueRouteParams) {
  return await withLeagueAdminAuth(async (auth) => {
    const body = await request.json() as {
      baseRules: BaseEventRules,
      predictionRules: BaseEventPredictionRules
    };

    if (!body.baseRules || !body.predictionRules) {
      return NextResponse.json({ error: 'Missing baseRules or predictionRules in request body' }, { status: 400 });
    }

    try {
      const success = await updateBaseEventRulesLogic(auth, body.baseRules, body.predictionRules);
      return NextResponse.json(success, { status: 200 });
    } catch (e) {
      console.error('Failed to update base event rules', e);
      return NextResponse.json({ error: 'An error occurred while updating the base event rules.' }, { status: 500 });
    }
  })(context);
}
