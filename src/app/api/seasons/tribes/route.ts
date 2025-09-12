import { type NextRequest, NextResponse } from 'next/server';
import { withSystemAdminAuth } from '~/lib/apiMiddleware';
import { createTribeLogic } from '~/services/seasons/mutation/createTribe';
import getTribes from '~/services/seasons/query/tribes';
import { type TribeInsert } from '~/types/tribes';

export async function GET(request: NextRequest) {
  const seasonIdParam = request.nextUrl.searchParams.get('seasonId');
  const seasonId = seasonIdParam ? parseInt(seasonIdParam, 10) : undefined;

  if (!seasonId) {
    return NextResponse.json({ error: 'Missing or invalid seasonId parameter' }, { status: 400 });
  }

  try {
    const tribes = await getTribes(seasonId);
    return NextResponse.json({ tribes }, { status: 200 });
  } catch (e) {
    console.error('Failed to get tribes', e);
    return NextResponse.json({ error: 'An error occurred while fetching tribes.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return await withSystemAdminAuth(async () => {
    const body = await request.json() as {
      seasonName: string
      tribes: TribeInsert[]
    };

    if (!body) {
      return NextResponse.json({ error: 'Missing body in request' }, { status: 400 });
    }

    try {
      const newTribes = await Promise.all(
        body.tribes.map(async (tribe) => await createTribeLogic(body.seasonName, tribe)
          .then(({ newTribeId }) => newTribeId)));
      return NextResponse.json({ newTribes }, { status: 201 });
    } catch (error) {
      console.error('Failed to create tribes', error);
      return NextResponse.json({ error: 'An error occurred while creating the tribes.' }, { status: 500 });
    }
  }
  )();
}
