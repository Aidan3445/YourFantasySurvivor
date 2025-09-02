import { type NextRequest, NextResponse } from 'next/server';
import getUserLeagueStatuses from '~/services/users/query/userLeaguesStatuses';

export async function GET(_: NextRequest) {
  try {
    const leaguesWithStatus = await getUserLeagueStatuses();
    return NextResponse.json({ leagues: leaguesWithStatus }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
