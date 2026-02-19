import { NextResponse, type NextRequest } from 'next/server';
import { withAuth } from '~/lib/apiMiddleware';
import { getLivePredictionLeaderboard } from '~/services/livePredictions/query/getLeaderboard';
import { changeLeaderboardUsername } from '~/services/users/mutation/changeLeaderboardUsername';

export async function GET(req: NextRequest) {
  return await withAuth(async () => {
    const seasonId = req.nextUrl.searchParams.get('seasonId');
    if (!seasonId) {
      return NextResponse.json({ error: 'Missing seasonId' }, { status: 400 });
    }

    try {
      const stats = await getLivePredictionLeaderboard(Number(seasonId));
      return NextResponse.json(stats);
    } catch (e) {
      console.error('Failed to get live prediction stats:', e);
      return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
  })();
}

export async function POST(req: NextRequest) {
  return await withAuth(async (userId) => {
    const encodedUsername = req.nextUrl.searchParams.get('username');
    if (!encodedUsername) {
      return NextResponse.json({ error: 'Missing username' }, { status: 400 });
    }

    const newUsername = decodeURIComponent(encodedUsername);

    try {
      const stats = await changeLeaderboardUsername(userId, newUsername);
      return NextResponse.json(stats);
    } catch (e) {
      console.error('Failed to get live prediction stats:', e);
      return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
  })();
}
