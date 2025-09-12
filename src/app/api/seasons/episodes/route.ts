import { type NextRequest, NextResponse } from 'next/server';
import { withSystemAdminAuth } from '~/lib/apiMiddleware';
import { createEpisodeLogic } from '~/services/seasons/mutation/createEpisode';
import { updateEpisodeLogic } from '~/services/seasons/mutation/updateEpisode';
import getEpisodes from '~/services/seasons/query/episodes';
import { type EpisodeUpdate, type EpisodeInsert } from '~/types/episodes';

export async function GET(request: NextRequest) {
  const seasonIdParam = request.nextUrl.searchParams.get('seasonId');
  const seasonId = seasonIdParam ? parseInt(seasonIdParam, 10) : undefined;

  if (!seasonId) {
    return NextResponse.json({ error: 'Missing or invalid seasonId parameter' }, { status: 400 });
  }

  try {
    const episodes = await getEpisodes(seasonId);
    return NextResponse.json({ episodes }, { status: 200 });
  } catch (e) {
    console.error('Failed to get episodes', e);
    return NextResponse.json({ error: 'An error occurred while fetching episodes.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return await withSystemAdminAuth(async () => {
    const body = await request.json() as {
      seasonName: string
      episodes: EpisodeInsert[]
    };

    if (!body) {
      return NextResponse.json({ error: 'Missing body in request' }, { status: 400 });
    }

    try {
      const newEpisodes = await Promise.all(
        body.episodes.map(async (episode) => await createEpisodeLogic(body.seasonName, episode)
          .then(({ newEpisodeId }) => newEpisodeId)));
      return NextResponse.json(newEpisodes, { status: 201 });
    } catch (error) {
      console.error('Failed to create episodes', error);
      return NextResponse.json({ error: 'An error occurred while creating the episodes.' }, { status: 500 });
    }
  })();
}

export async function PUT(request: NextRequest) {
  return await withSystemAdminAuth(async () => {
    const body = await request.json() as EpisodeUpdate;

    if (!body) {
      return NextResponse.json({ error: 'Missing body in request' }, { status: 400 });
    }

    try {
      const success = await updateEpisodeLogic(body);
      return NextResponse.json(success, { status: 200 });
    } catch (error) {
      console.error('Failed to update episode', error);
      return NextResponse.json({ error: 'An error occurred while updating the episode.' }, { status: 500 });
    }
  })();
}
