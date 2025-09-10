import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import saveChatMessageLogic from '~/services/leagues/mutation/saveChatMessage';
import { withLeagueMemberAuth } from '~/lib/apiMiddleware';

export async function POST(request: NextRequest, context: LeagueRouteParams) {
  return await withLeagueMemberAuth(async (auth) => {
    const body = await request.json() as {
      message: {
        serial: string,
        text: string,
        timestamp: string
      }
    };

    if (!body?.message?.serial || !body?.message?.text || !body?.message?.timestamp) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    try {
      const success = await saveChatMessageLogic(auth, body.message);
      return NextResponse.json(success, { status: 201 });
    } catch (e) {
      console.error('Failed to save chat message', e);
      return NextResponse.json(
        { error: 'An error occurred while saving the chat message.' },
        { status: 500 }
      );
    }
  })(context);
}
