import { NextResponse, type NextRequest } from 'next/server';
import { type LivePredictionOptionInput } from '~/types/events';
import { withAuth, withSystemAdminAuth } from '~/lib/apiMiddleware';
import { getLivePredictionsForEpisode } from '~/services/livePredictions/query/getLivePredictions';
import { createLivePrediction } from '~/services/livePredictions/mutation/create';

export async function GET(req: NextRequest) {
  return await withAuth(async (userId) => {
    const episodeId = Number(req.nextUrl.searchParams.get('episodeId'));
    if (!episodeId) return NextResponse.json({ error: 'Missing episodeId' }, { status: 400 });

    const predictions = await getLivePredictionsForEpisode(episodeId, userId);

    return NextResponse.json(predictions);
  })();
}

export async function POST(req: NextRequest) {
  return await withSystemAdminAuth(async () => {
    const body = await req.json() as {
      seasonId: number;
      episodeId: number;
      title: string;
      description?: string;
      options: LivePredictionOptionInput[];
    };

    if (!body.seasonId || !body.episodeId || !body.title || !body.options?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
      const prediction = await createLivePrediction(
        body.seasonId,
        body.episodeId,
        body.title,
        body.description ?? null,
        body.options,
      );
      return NextResponse.json(prediction, { status: 201 });
    } catch (e) {
      console.error('Failed to create live prediction:', e);
      return NextResponse.json({ error: 'Failed to create prediction' }, { status: 500 });
    }
  })();
}
