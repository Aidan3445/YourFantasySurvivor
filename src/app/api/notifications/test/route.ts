import 'server-only';
import { NextResponse } from 'next/server';
import { withAuth } from '~/lib/apiMiddleware';
import { sendPushToUser } from '~/services/notifications/push';

export async function POST() {
  return withAuth(async (userId) => {
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
      await sendPushToUser(userId, {
        title: 'Test Notification',
        body: 'If you see this, push notifications are working!',
        data: { type: 'test' },
      });

      return NextResponse.json({ message: 'Sent! Check your device.' }, { status: 200 });
    } catch (e) {
      console.error('Test push failed:', e);
      return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
    }
  })();
}
