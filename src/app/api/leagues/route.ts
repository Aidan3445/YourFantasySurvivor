import { type NextRequest, NextResponse } from 'next/server';
import getUserLeagues from '~/services/leagues/query/userLeagues';

export async function GET(_: NextRequest) {
  try {
    const leagues = await getUserLeagues();
    return NextResponse.json({ leagues }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
