import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { Receiver } from '@upstash/qstash';
import { type NotificationType } from '~/types/notifications';
import {
  sendEpisodeFinishedNotifications,
  sendEpisodeStartingNotifications,
  sendReminderNotifications
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
    episodeId: number;
  };

  try {
    switch (type) {
      case 'reminder_midweek':
        await sendReminderNotifications(episodeId, 'midweek');
        break;
      case 'reminder_8hr':
        await sendReminderNotifications(episodeId, '8hr');
        break;
      case 'reminder_15min':
        await sendReminderNotifications(episodeId, '15min');
        break;
      case 'episode_starting':
        await sendEpisodeStartingNotifications(episodeId);
        break;
      case 'episode_finished':
        await sendEpisodeFinishedNotifications(episodeId);
        break;
      default:
        console.error('Unknown notification type:', type);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(`Failed to send ${type} notification for episode ${episodeId}:`, error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
