import { type NextRequest, NextResponse } from 'next/server';
import { withSystemAdminAuth } from '~/lib/apiMiddleware';
import { createCastawayLogic } from '~/services/seasons/mutation/createCastaway';
import getCastaways from '~/services/seasons/query/castaways';
import { type CastawayInsert } from '~/types/castaways';

export async function GET(request: NextRequest) {
  const seasonIdParam = request.nextUrl.searchParams.get('seasonId');
  const seasonId = seasonIdParam ? parseInt(seasonIdParam, 10) : undefined;

  if (!seasonId) {
    return NextResponse.json({ error: 'Missing or invalid seasonId parameter' }, { status: 400 });
  }

  try {
    const castaways = await getCastaways(seasonId);
    return NextResponse.json(castaways, { status: 200 });
  } catch (e) {
    console.error('Failed to get castaways', e);
    return NextResponse.json({ error: 'An error occurred while fetching castaways.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return await withSystemAdminAuth(async () => {
    const body = await request.json() as {
      seasonName: string
      castaways: CastawayInsert[]
    };

    if (!body) {
      return NextResponse.json({ error: 'Missing body in request' }, { status: 400 });
    }

    try {
      const newCastaways = await Promise.all(
        body.castaways.map(async (castaway) => await createCastawayLogic(body.seasonName, castaway)
          .then(({ newCastawayId }) => newCastawayId)));
      return NextResponse.json(newCastaways, { status: 201 });
    } catch (error) {
      console.error('Failed to create castaways', error);
      return NextResponse.json({ error: 'An error occurred while creating the castaways.' }, { status: 500 });
    }
  })();
}
