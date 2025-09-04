import { type NextRequest, NextResponse } from 'next/server';
import { requireSystemAdminAuth } from '~/lib/auth';
import getBaseEvents from '~/services/seasons/query/baseEvents';
import createBaseEventLogic from '~/services/seasons/mutation/createBaseEvent';
import deleteBaseEventLogic from '~/services/seasons/mutation/deleteBaseEvent';
import updateBaseEventLogic from '~/services/seasons/mutation/updateBaseEvent';
import { type BaseEventInsert } from '~/types/events';

export async function GET(req: NextRequest) {
  const seasonIdParam = req.nextUrl.searchParams.get('seasonId');
  const seasonId = seasonIdParam ? parseInt(seasonIdParam, 10) : undefined;

  if (!seasonId) {
    return NextResponse.json({ error: 'Missing or invalid seasonId parameter' }, { status: 400 });
  }

  try {
    const baseEvents = await getBaseEvents(seasonId);
    return NextResponse.json({ baseEvents }, { status: 200 });
  } catch (e) {
    console.error('Failed to get base events', e);
    return NextResponse.json({ error: 'An error occurred while fetching base events.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const baseEvent = await request.json() as BaseEventInsert;
    const newEventId = await requireSystemAdminAuth(createBaseEventLogic)(baseEvent);
    return NextResponse.json({ newEventId }, { status: 201 });
  } catch (error) {
    let message: string;
    if (error instanceof Error) message = error.message;
    else message = String(error);

    if (message === 'User not authorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { baseEventId, baseEvent } = await request.json() as {
      baseEventId: number,
      baseEvent: BaseEventInsert
    };
    const { success } = await requireSystemAdminAuth(updateBaseEventLogic)(baseEventId, baseEvent);
    return NextResponse.json({ success }, { status: 200 });
  } catch (error) {
    let message: string;
    if (error instanceof Error) message = error.message;
    else message = String(error);

    if (message === 'User not authorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { baseEventId } = await request.json() as { baseEventId: number };
    const { success } = await requireSystemAdminAuth(deleteBaseEventLogic)(baseEventId);
    return NextResponse.json({ success }, { status: 200 });
  } catch (error) {
    let message: string;
    if (error instanceof Error) message = error.message;
    else message = String(error);

    if (message === 'User not authorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
