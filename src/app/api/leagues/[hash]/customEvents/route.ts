import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import { withLeagueAuth } from '~/lib/api-middleware';
import getCustomEvents from '~/services/leagues/query/customEvents';

export async function GET(request: NextRequest, context: LeagueRouteParams) {
  return withLeagueAuth(async (_, context, __) => {
    const { hash } = await context.params;
    try {
      const customEvents = await getCustomEvents(hash);
      return NextResponse.json({ customEvents }, { status: 200 });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
  })(request, context);
}
