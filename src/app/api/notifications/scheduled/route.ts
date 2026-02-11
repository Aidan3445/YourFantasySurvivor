import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { Receiver } from '@upstash/qstash';
import { type NotificationType } from '~/types/notifications';
import { type Episode } from '~/types/episodes';
import { sendEpisodeFinishedNotifications, sendEpisodeStartingNotifications, sendReminderNotifications } from '~/services/notifications/cron/predictions';

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function POST(request: NextRequest) {
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

  const { type, episode } = JSON.parse(body) as {
    type: NotificationType;
    episode: Episode;
  };

  try {
    switch (type) {
      case 'reminder_midweek':
        await sendReminderNotifications('midweek', episode);
        break;
      case 'reminder_8hr':
        await sendReminderNotifications('8hr', episode);
        break;
      case 'reminder_15min':
        await sendReminderNotifications('15min', episode);
        break;
      case 'episode_starting':
        await sendEpisodeStartingNotifications(episode);
        break;
      case 'episode_finished':
        await sendEpisodeFinishedNotifications(episode);
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
