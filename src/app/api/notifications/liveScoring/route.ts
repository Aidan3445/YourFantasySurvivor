import { type NextRequest, NextResponse } from 'next/server';
import { withAuth } from '~/lib/apiMiddleware';
import { toggleLiveScoringOptIn } from '~/services/notifications/events/liveScoringOptInOut';
import { getLiveScoringSession } from '~/services/users/query/getLiveScoringSession';

export async function GET(req: NextRequest) {
  return withAuth(async (userId) => {
    const episodeId = Number(req.nextUrl.searchParams.get('episodeId'));
    if (!episodeId) return NextResponse.json({ error: 'Missing episodeId' }, { status: 400 });

    try {
      const session = await getLiveScoringSession(userId, episodeId);
      return NextResponse.json({ optedIn: !!session });
    } catch (e) {
      console.error('Failed to get live scoring session:', e);
      return NextResponse.json({ error: 'Failed to get live scoring session' }, { status: 500 });
    }
  })();
}

export async function POST(request: NextRequest) {
  return withAuth(async (userId) => {
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json() as { episodeId: number };
    if (!body.episodeId) {
      return NextResponse.json({ error: 'Missing episodeId' }, { status: 400 });
    }

    try {
      await toggleLiveScoringOptIn(userId, body.episodeId, true);

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (e) {
      console.error('Failed to opt-in to live scoring:', e);
      return NextResponse.json({ error: 'Failed to opt-in' }, { status: 500 });
    }
  })();
}

export async function DELETE(request: NextRequest) {
  return withAuth(async (userId) => {
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json() as { episodeId: number };
    if (!body.episodeId) {
      return NextResponse.json({ error: 'Missing episodeId' }, { status: 400 });
    }

    try {
      await toggleLiveScoringOptIn(userId, body.episodeId, false);

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (e) {
      console.error('Failed to opt-out of live scoring:', e);
      return NextResponse.json({ error: 'Failed to opt-out' }, { status: 500 });
    }
  })();
}
