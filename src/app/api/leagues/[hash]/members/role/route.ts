import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import { withLeagueAdminAuth } from '~/lib/apiMiddleware';
import updateRoleLogic from '~/services/leagues/mutation/updateMemberRole';
import { type LeagueMemberRole } from '~/types/leagueMembers';

export async function PUT(request: NextRequest, context: LeagueRouteParams) {
  return withLeagueAdminAuth(async (auth) => {
    const body = await request.json() as {
      memberId: number;
      role: LeagueMemberRole;
    };

    if (!body.memberId || !body.role) {
      return NextResponse.json({ error: 'memberId and role are required in the request body.' }, { status: 400 });
    }

    try {
      const success = await updateRoleLogic(auth, body.memberId, body.role);
      return NextResponse.json(success, { status: 200 });
    } catch (e) {
      console.error('Failed to update member details', e);
      return NextResponse.json({ error: 'An error occurred while updating the member details.' }, { status: 500 });
    }
  })(context);
}
