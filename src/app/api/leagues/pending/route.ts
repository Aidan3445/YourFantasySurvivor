import { type NextRequest, NextResponse } from 'next/server';
import { withAuth } from '~/lib/apiMiddleware';
import getPendingLeagues from '~/services/users/query/getPendingLeagues';

export async function GET(_: NextRequest) {
  return withAuth(async (userId) => {
    try {
      const leagues = await getPendingLeagues(userId);
      return NextResponse.json({ leagues }, { status: 200 });
    } catch (e) {
      console.error('Failed to get user leagues', e);
      return NextResponse.json({ error: 'An error occurred while fetching leagues.' }, { status: 500 });
    }
  })();
}
