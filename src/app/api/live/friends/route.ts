import { NextResponse, type NextRequest } from 'next/server';
import { withAuth } from '~/lib/apiMiddleware';
import { getLivePredictionFriendsLeaderboard } from '~/services/livePredictions/query/getFriendsLeaderboard';

export async function GET(req: NextRequest) {
  return await withAuth(async (userId) => {
    const seasonId = req.nextUrl.searchParams.get('seasonId');
    if (!seasonId) {
      return NextResponse.json({ error: 'Missing seasonId' }, { status: 400 });
    }

    try {
      const stats = await getLivePredictionFriendsLeaderboard(userId, Number(seasonId));
      return NextResponse.json(stats);
    } catch (e) {
      console.error('Failed to get live prediction friends leaderboard:', e);
      return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
  })();
}
