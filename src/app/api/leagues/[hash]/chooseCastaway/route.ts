import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import { requireLeagueMemberAuth } from '~/lib/auth';
import chooseCastawayLogic from '~/services/leagues/mutation/chooseCastaway';

export async function POST(request: NextRequest, context: LeagueRouteParams) {
  try {
    const { hash } = await context.params;
    const body = await request.json() as {
      castawayId: number;
      isDraft: boolean;
    };

    await requireLeagueMemberAuth(chooseCastawayLogic)(
      hash,
      body.castawayId,
      body.isDraft
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    let message: string;
    if (error instanceof Error) message = error.message;
    else message = String(error);

    if (message.includes('User not') || message.includes('Not a league member')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
