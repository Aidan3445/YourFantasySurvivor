import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { withAuth } from '~/lib/apiMiddleware';
import { db } from '~/server/db';
import { liveScoringSessionSchema } from '~/server/db/schema/notifications';
import { eq, and } from 'drizzle-orm';

// Opt-in to live scoring for an episode
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
      await db
        .insert(liveScoringSessionSchema)
        .values({ episodeId: body.episodeId, userId })
        .onConflictDoNothing();

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (e) {
      console.error('Failed to opt-in to live scoring:', e);
      return NextResponse.json({ error: 'Failed to opt-in' }, { status: 500 });
    }
  })();
}

// Opt-out of live scoring for an episode
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
      await db
        .delete(liveScoringSessionSchema)
        .where(and(
          eq(liveScoringSessionSchema.episodeId, body.episodeId),
          eq(liveScoringSessionSchema.userId, userId)
        ));

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (e) {
      console.error('Failed to opt-out of live scoring:', e);
      return NextResponse.json({ error: 'Failed to opt-out' }, { status: 500 });
    }
  })();
}
