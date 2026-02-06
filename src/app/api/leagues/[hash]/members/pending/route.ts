import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import { withLeagueAdminAuth } from '~/lib/apiMiddleware';
import getPendingMembers from '~/services/leagues/query/pendingMembers';
import admitMemberLogic from '~/services/leagues/mutation/admitMember';

export async function GET(r: NextRequest, context: LeagueRouteParams) {
  return withLeagueAdminAuth(async (auth) => {
    try {
      const pendingMembers = await getPendingMembers(auth);
      if (!pendingMembers) {
        return NextResponse.json({ error: 'League not found' }, { status: 404 });
      }
      return NextResponse.json({ leagueMembers: pendingMembers }, { status: 200 });
    } catch (e) {
      console.error('Failed to get league members', e);
      return NextResponse.json({ error: 'An error occurred while fetching league members.' }, { status: 500 });
    }
  })(context);
}

export async function PUT(request: NextRequest, context: LeagueRouteParams) {
  return withLeagueAdminAuth(async (auth) => {
    const body = await request.json() as {
      pendingMemberId: number;
    };

    if (!body.pendingMemberId) {
      return NextResponse.json({ error: 'Missing member in request body' }, { status: 400 });
    }

    try {
      const success = await admitMemberLogic(auth, body.pendingMemberId);
      return NextResponse.json(success, { status: 200 });
    } catch (e) {
      console.error('Failed to update member details', e);
      return NextResponse.json({ error: 'An error occurred while updating the member details.' }, { status: 500 });
    }
  })(context);
}
