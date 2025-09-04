import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import type { LeagueRouteParams } from '~/types/api';
import { withLeagueAdminAuth, withLeagueMemberAuth } from '~/lib/apiMiddleware';
import createCustomEventLogic from '~/services/leagues/mutation/createCustomEvent';
import updateCustomEventLogic from '~/services/leagues/mutation/updateCustomEvent';
import deleteCustomEventLogic from '~/services/leagues/mutation/deleteCustomEvent';
import { type CustomEventInsert } from '~/types/events';
import getCustomEventsAndPredictions from '~/services/leagues/query/customEvents';

export async function GET(_: NextRequest, context: LeagueRouteParams) {
  return withLeagueMemberAuth(async (auth) => {
    try {
      const { events, predictions } = await getCustomEventsAndPredictions(auth);
      return NextResponse.json({ events, predictions }, { status: 200 });
    } catch (e) {
      console.error('Failed to fetch custom events and predictions', e);
      return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
  })(context);
}

export async function POST(request: NextRequest, context: LeagueRouteParams) {
  return withLeagueAdminAuth(async (auth) => {
    try {
      const body = await request.json() as {
        event: CustomEventInsert;
      };

      const newEvent = await createCustomEventLogic(auth, body.event);
      return NextResponse.json({ event: newEvent }, { status: 201 });
    } catch (e) {
      console.error('Failed to create custom event', e);
      return NextResponse.json({ error: 'Failed to create custom event' }, { status: 500 });
    }
  })(context);
}

export async function PUT(request: NextRequest, context: LeagueRouteParams) {
  return withLeagueAdminAuth(async (auth) => {
    try {
      const body = await request.json() as {
        eventId: number;
        event: CustomEventInsert;
      };

      const { success } = await updateCustomEventLogic(auth, body.eventId, body.event);
      return NextResponse.json({ success }, { status: 200 });
    } catch (e) {
      console.error('Failed to update custom event', e);
      return NextResponse.json({ error: 'Failed to update custom event' }, { status: 500 });
    }
  })(context);
}

export async function DELETE(request: NextRequest, context: LeagueRouteParams) {
  return withLeagueAdminAuth(async (auth) => {
    try {
      const { searchParams } = new URL(request.url);
      const eventIdParam = searchParams.get('eventId');

      if (!eventIdParam) {
        return NextResponse.json({ error: 'Missing eventId parameter' }, { status: 400 });
      }

      const eventId = parseInt(eventIdParam, 10);
      if (isNaN(eventId)) {
        return NextResponse.json({ error: 'Invalid eventId parameter' }, { status: 400 });
      }

      const { success } = await deleteCustomEventLogic(auth, eventId);
      return NextResponse.json({ success }, { status: 200 });
    } catch (e) {
      console.error('Failed to delete custom event', e);
      return NextResponse.json({ error: 'Failed to delete custom event' }, { status: 500 });
    }
  })(context);
}
