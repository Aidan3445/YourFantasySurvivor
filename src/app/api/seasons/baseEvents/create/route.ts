import { type NextRequest, NextResponse } from 'next/server';
import { requireSystemAdminAuth } from '~/lib/auth';
import createBaseEventLogic from '~/services/seasons/mutation/createBaseEvent';
import { type BaseEventInsert } from '~/types/events';

export async function POST(request: NextRequest) {
  try {
    const baseEvent = await request.json() as BaseEventInsert;
    const newEventId = await requireSystemAdminAuth(createBaseEventLogic)(baseEvent);
    return NextResponse.json({ newEventId }, { status: 200 });
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
