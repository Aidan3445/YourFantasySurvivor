import { NextResponse, type NextRequest } from 'next/server';
import { withAuth, withSystemAdminAuth } from '~/lib/apiMiddleware';
import { closeLivePrediction } from '~/services/notifications/livePredictions/close';
import { deleteLivePrediction } from '~/services/notifications/livePredictions/delete';
import { resolveLivePrediction } from '~/services/notifications/livePredictions/resolve';
import { respondToLivePrediction } from '~/services/notifications/livePredictions/respond';
import { togglePauseLivePrediction } from '~/services/notifications/livePredictions/togglePause';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  return await withAuth(async (userId) => {
    const { id } = await params;
    const livePredictionId = Number(id);
    if (!livePredictionId) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const body = await req.json() as { optionId: number };
    if (!body.optionId) return NextResponse.json({ error: 'Missing optionId' }, { status: 400 });

    try {
      const response = await respondToLivePrediction(livePredictionId, body.optionId, userId);
      return NextResponse.json(response);
    } catch (e) {
      console.error('Failed to respond to live prediction:', e);
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'Something went wrong' },
        { status: 500 },
      );
    }
  })();
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  return await withSystemAdminAuth(async () => {
    const { id } = await params;
    const livePredictionId = Number(id);
    if (!livePredictionId) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const body = await req.json() as {
      action: 'close' | 'resolve' | 'togglePause';
      correctOptionIds?: number[];
    };

    try {
      switch (body.action) {
        case 'close': {
          const result = await closeLivePrediction(livePredictionId);
          return NextResponse.json(result);
        }
        case 'resolve': {
          const result = await resolveLivePrediction(
            livePredictionId,
            body.correctOptionIds ?? [],
          );
          return NextResponse.json(result);
        }
        case 'togglePause': {
          const result = await togglePauseLivePrediction(livePredictionId);
          return NextResponse.json(result);
        }
        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
    } catch (e) {
      console.error(`Failed to ${body.action} live prediction:`, e);
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'Something went wrong' },
        { status: 500 },
      );
    }
  })();
}

export async function DELETE(_: NextRequest, { params }: RouteParams) {
  return await withSystemAdminAuth(async () => {
    const { id } = await params;
    const livePredictionId = Number(id);
    if (!livePredictionId) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    try {
      const result = await deleteLivePrediction(livePredictionId);
      return NextResponse.json(result);
    } catch (e) {
      console.error('Failed to delete live prediction:', e);
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'Something went wrong' },
        { status: 500 },
      );
    }
  })();
}
