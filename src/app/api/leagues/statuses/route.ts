import { type NextRequest, NextResponse } from 'next/server';
import getUserLeagueStatuses from '~/services/users/query/userLeaguesStatuses';

export async function GET(_: NextRequest) {
  try {
    const leaguesStatus = await getUserLeagueStatuses();
    return NextResponse.json({ leaguesStatus }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
