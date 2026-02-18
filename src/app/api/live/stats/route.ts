import { NextResponse, type NextRequest } from 'next/server';
import { withAuth } from '~/lib/apiMiddleware';
import { getLivePredictionUserStats } from '~/services/notifications/livePredictions/stats';

export async function GET(req: NextRequest) {
  return await withAuth(async (userId) => {
    const seasonId = req.nextUrl.searchParams.get('seasonId');

    try {
      const stats = await getLivePredictionUserStats(
        userId,
        seasonId ? Number(seasonId) : undefined,
      );
      return NextResponse.json(stats);
    } catch (e) {
      console.error('Failed to get live prediction stats:', e);
      return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
  })();
}
