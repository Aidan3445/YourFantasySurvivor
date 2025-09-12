import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import { withLeagueMemberAuth } from '~/lib/apiMiddleware';
import updateAdminsLogic from '~/services/leagues/mutation/updateAdmins';

export async function POST(request: NextRequest, context: LeagueRouteParams) {
  return await withLeagueMemberAuth(async (auth) => {
    const body = await request.json() as {
      admins: number[];
    };

    if (body?.admins) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    try {
      const success = await updateAdminsLogic(auth, body.admins);
      return NextResponse.json(success, { status: 200 });
    } catch (e) {
      console.error('Failed to update admins', e);
      return NextResponse.json(
        { error: 'An error occurred while updating the admins. Please try again.' },
        { status: 500 }
      );
    }
  })(context);
}
