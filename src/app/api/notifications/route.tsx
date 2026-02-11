import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { withAuth } from '~/lib/apiMiddleware';
import registerPushToken from '~/services/notifications/mutation/registerPushToken';
import unregisterPushToken from '~/services/notifications/mutation/unregisterPushToken';
import updatePushPreferences from '~/services/notifications/mutation/updatePushPreferences';
import { type Notifications } from '~/types/notifications';

export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    const body = await request.json() as Notifications;

    if (!body.token || !body.platform) {
      return NextResponse.json({ error: 'Missing token or platform' }, { status: 400 });
    }

    try {
      const result = await registerPushToken(body, userId);
      return NextResponse.json(result, { status: 200 });
    } catch (e) {
      console.error('Failed to register push token', e);
      return NextResponse.json({ error: 'An error occurred while registering push token.' }, { status: 500 });
    }
  })();
}

export async function PUT(request: NextRequest) {
  return withAuth(async (userId) => {
    const body = await request.json() as Notifications;

    if (!body.token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    if (!body.enabled && !body.preferences) {
      return NextResponse.json({ error: 'No preferences to update' }, { status: 400 });
    }

    try {
      const result = await updatePushPreferences(body, userId);
      return NextResponse.json(result, { status: 200 });
    } catch (e) {
      console.error('Failed to update push preferences', e);
      return NextResponse.json({ error: 'An error occurred while updating preferences.' }, { status: 500 });
    }
  })();
}

export async function DELETE(request: NextRequest) {
  return withAuth(async (userId) => {
    const body = await request.json() as {
      token: string;
    };

    if (!body.token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    try {
      const result = await unregisterPushToken(body.token, userId);
      return NextResponse.json(result, { status: 200 });
    } catch (e) {
      console.error('Failed to unregister push token', e);
      return NextResponse.json({ error: 'An error occurred while unregistering push token.' }, { status: 500 });
    }
  })();
}
