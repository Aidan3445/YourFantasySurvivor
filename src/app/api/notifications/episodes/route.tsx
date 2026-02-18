import { NextResponse } from 'next/server';
import { scheduleUpcomingEpisodeNotifications } from '~/services/notifications/reminders/cron';

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.QSTASH_CRON_SECRET_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await scheduleUpcomingEpisodeNotifications();
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    console.error('Failed to schedule episode notifications', e);
    return NextResponse.json({ error: 'An error occurred while scheduling notifications.' }, { status: 500 });
  }
}
