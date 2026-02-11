import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { Receiver } from '@upstash/qstash';
import { type NotificationType } from '~/types/notifications';
import { type Episode } from '~/types/episodes';
import {
  sendEpisodeFinishedNotifications,
  sendEpisodeStartingNotifications,
  sendReminderNotifications,
} from '~/services/notifications/reminders/predictions';
import { sendDraftDateNotification, sendDraftReminderNotification } from '~/services/notifications/reminders/draftDate';
import { sendSelectionChangeNotification } from '~/services/notifications/reminders/selectionChange';

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

  const parsed = JSON.parse(body) as {
    type: NotificationType;
    episode?: Episode;
    draft?: {
      leagueId: number;
      leagueHash: string;
      leagueName: string;
      draftDate: string | null;
    };
    selection?: {
      leagueId: number;
      leagueHash: string;
      leagueName: string;
      userId: string;
      memberId: number;
      memberName: string;
      castawayId: number;
      castawayName: string;
      episodeId: number;
    };
  };

  try {
    switch (parsed.type) {
      case 'reminder_midweek':
        await sendReminderNotifications('midweek', parsed.episode!);
        break;
      case 'reminder_8hr':
        await sendReminderNotifications('8hr', parsed.episode!);
        break;
      case 'reminder_15min':
        await sendReminderNotifications('15min', parsed.episode!);
        break;
      case 'episode_starting':
        await sendEpisodeStartingNotifications(parsed.episode!);
        break;
      case 'episode_finished':
        await sendEpisodeFinishedNotifications(parsed.episode!);
        break;
      case 'draft_date_changed':
        await sendDraftDateNotification(parsed.draft!);
        break;
      case 'draft_reminder_1hr':
        await sendDraftReminderNotification(parsed.draft!);
        break;
      case 'selection_changed':
        await sendSelectionChangeNotification(parsed.selection!);
        break;
      default:
        console.error('Unknown notification type:', parsed.type);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(`Failed to send ${parsed.type} notification:`, error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
