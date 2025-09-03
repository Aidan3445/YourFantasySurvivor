import { type NextRequest, NextResponse } from 'next/server';
import { requireSystemAdminAuth } from '~/lib/auth';
import { deleteBaseEventLogic } from '~/services/seasons/mutation/deleteBaseEvent';

export async function POST(request: NextRequest) {
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
