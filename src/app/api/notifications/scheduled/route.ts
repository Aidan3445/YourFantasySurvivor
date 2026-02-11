import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { Receiver } from '@upstash/qstash';
import { type NotificationType } from '~/types/notifications';
import {
  sendReminderNotifications,
  sendEpisodeStartingNotifications,
  sendEpisodeFinishedNotifications
} from '~/services/notifications/cron/predictions';

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function POST(request: NextRequest) {
  // Verify request is from QStash
  const signature = request.headers.get('upstash-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  }

  const body = await request.text();

  try {
    await receiver.verify({ signature, body });
  } catch (error) {
    console.error('Invalid QStash signature:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const { type, episodeId } = JSON.parse(body) as {
    type: NotificationType;
    episodeId?: number;
  };

  try {
    switch (type) {
      case 'reminder_midweek':
        await sendReminderNotifications('midweek');
        break;
      case 'reminder_8hr':
        await sendReminderNotifications('8hr');
        break;
      case 'reminder_15min':
        await sendReminderNotifications('15min');
        break;
      case 'episode_starting':
        if (!episodeId) throw new Error('episodeId required for episode_starting');
        await sendEpisodeStartingNotifications(episodeId);
        break;
      case 'episode_finished':
        if (!episodeId) throw new Error('episodeId required for episode_finished');
        await sendEpisodeFinishedNotifications(episodeId);
        break;
      default:
        console.error('Unknown notification type:', type);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(`Failed to send ${type} notification:`, error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
