import { type NextRequest, NextResponse } from 'next/server';
import getUserLeagues from '~/services/users/query/userLeagues';

export async function GET(_: NextRequest) {
  try {
    console.log('Fetching user leagues');
    const leagues = await getUserLeagues();
    console.log('Fetched leagues:', leagues);
    return NextResponse.json({ leagues }, { status: 200 });
  } catch (e) {
    console.error('Failed to get user leagues', e);
    return NextResponse.json({ error: 'An error occurred while fetching leagues.' }, { status: 500 });
  }
}
