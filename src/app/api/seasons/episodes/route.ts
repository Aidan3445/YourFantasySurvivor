import { type NextRequest, NextResponse } from 'next/server';
import getEpisodes from '~/services/seasons/query/episodes';

export async function GET(req: NextRequest) {
  const seasonIdParam = req.nextUrl.searchParams.get('seasonId');
  const seasonId = seasonIdParam ? parseInt(seasonIdParam, 10) : undefined;
  const mostRecentOnlyParam = req.nextUrl.searchParams.get('mostRecentOnly');
  const mostRecentOnly = mostRecentOnlyParam === 'true';

  if (!seasonId) {
    return NextResponse.json({ error: 'Missing or invalid seasonId parameter' }, { status: 400 });
  }

  try {
    const episodes = await getEpisodes(seasonId, mostRecentOnly);
    return NextResponse.json(episodes, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
