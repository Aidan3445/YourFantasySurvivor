import 'server-only';
import { NextResponse } from 'next/server';
import { withSystemAdminAuth } from '~/lib/apiMiddleware';
import { sendPushToUser } from '~/services/notifications/push';

export async function POST() {
  return withSystemAdminAuth(async (userId) => {


    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const randomNum = Math.floor(Math.random() * 1000);

    try {
      await sendPushToUser(userId, {
        title: 'Test Notification',
        body: `If you see this, push notifications are working! Random number: ${randomNum}`,
        data: { type: 'test' },
        collapseId: 'test-notification',
      });

      return NextResponse.json({ message: 'Sent! Check your device.' }, { status: 200 });
    } catch (e) {
      console.error('Test push failed:', e);
      return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
    }
  })();
}
