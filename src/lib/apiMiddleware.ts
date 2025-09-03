import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import { leagueMemberAuth } from '~/lib/auth';
import type { LeagueMemberAuth, LeagueRouteParams } from '~/types/api';

export function withLeagueAuth(
  handler: (
    request: NextRequest,
    context: LeagueRouteParams,
    auth: LeagueMemberAuth
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: LeagueRouteParams) => {
    const { hash } = await context.params;

    const auth = await leagueMemberAuth(hash);

    if (!auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!auth.memberId) {
      return NextResponse.json({ error: 'Not a league member' }, { status: 403 });
    }

    return handler(request, context, auth);
  };
}
