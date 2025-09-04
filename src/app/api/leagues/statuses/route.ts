import { type NextRequest, NextResponse } from 'next/server';
import getUserLeagueStatuses from '~/services/users/query/userLeaguesStatuses';

export async function GET(_: NextRequest) {
  try {
    const leaguesStatus = await getUserLeagueStatuses();
    return NextResponse.json({ leaguesStatus }, { status: 200 });
  } catch (e) {
    console.error('Failed to get user league statuses', e);
    return NextResponse.json({ error: 'An error occurred while fetching league statuses.' }, { status: 500 });
  }
}
