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
      console.error('Failed to get live prediction leaderboard:', e);
      return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
  })();
}

export async function POST(req: NextRequest) {
  return await withAuth(async (userId) => {
    let newUsername: string | undefined;
    try {
      const body = await req.json() as { newUsername?: string };
      newUsername = body.newUsername;
    } catch {
      console.log('Establishing default username for user');
    }
    try {
      await changeLeaderboardUsername(userId, newUsername);
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (e) {
      console.error('Failed to change leaderboard username:', e);
      return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
  })();
}
