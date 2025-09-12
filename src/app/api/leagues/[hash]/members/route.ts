import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import { withLeagueMemberAuth } from '~/lib/apiMiddleware';
import getLeagueMembers from '~/services/leagues/query/members';
import updateMemberDetailsLogic from '~/services/leagues/mutation/updateMemberDetails';
import { type LeagueMemberInsert } from '~/types/leagueMembers';

export async function GET(_: NextRequest, context: LeagueRouteParams) {
  return withLeagueMemberAuth(async (auth) => {
    try {
      const leagueMembers = await getLeagueMembers(auth);
      if (!leagueMembers) {
        return NextResponse.json({ error: 'League not found' }, { status: 404 });
      }
      return NextResponse.json({ leagueMembers }, { status: 200 });
    } catch (e) {
      console.error('Failed to get league members', e);
      return NextResponse.json({ error: 'An error occurred while fetching league members.' }, { status: 500 });
    }
  })(context);
}

export async function PUT(request: NextRequest, context: LeagueRouteParams) {
  return withLeagueMemberAuth(async (auth) => {
    const body = await request.json() as {
      member: LeagueMemberInsert
    };

    if (!body.member) {
      return NextResponse.json({ error: 'Missing member in request body' }, { status: 400 });
    }

    try {
      const success = await updateMemberDetailsLogic(auth, body.member);
      return NextResponse.json(success, { status: 200 });
    } catch (e) {
      console.error('Failed to update member details', e);
      return NextResponse.json({ error: 'An error occurred while updating the member details.' }, { status: 500 });
    }
  })(context);
}
