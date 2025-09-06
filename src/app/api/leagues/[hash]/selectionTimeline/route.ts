import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import { withLeagueMemberAuth } from '~/lib/apiMiddleware';
import getSelectionTimeline from '~/services/leagues/query/selectionTimeline';

export async function GET(_: NextRequest, context: LeagueRouteParams) {
  return withLeagueMemberAuth(async (auth) => {
    try {
      const selectionTimeline = await getSelectionTimeline(auth);
      return NextResponse.json(selectionTimeline, { status: 200 });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: 'Failed to fetch selection timeline' }, { status: 500 });
    }
  })(context);
}
