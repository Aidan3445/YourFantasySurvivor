import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import { withLeagueMemberAuth } from '~/lib/apiMiddleware';
import deleteMemberLogic from '~/services/leagues/mutation/deleteMember';

export async function DELETE(_: NextRequest, context: LeagueRouteParams) {
  return withLeagueMemberAuth(async (auth) => {
    try {
      const success = await deleteMemberLogic(auth, auth.memberId);
      return NextResponse.json(success, { status: 200 });
    } catch (e) {
      console.error('Failed to delete member', e);
      return NextResponse.json({ error: 'An error occurred while deleting the member.' }, { status: 500 });
    }
  })(context);
}
