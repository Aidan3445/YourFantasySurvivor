import { type NextRequest, NextResponse } from 'next/server';
import getKeyEpisodes from '~/services/leagues/query/getKeyEpisodes';

export async function GET(request: NextRequest) {
  const seasonIdParam = request.nextUrl.searchParams.get('seasonId');
  const seasonId = seasonIdParam ? parseInt(seasonIdParam, 10) : undefined;

  if (!seasonId) {
    return NextResponse.json({ error: 'Missing or invalid seasonId parameter' }, { status: 400 });
  }

  try {
    const episodes = await getKeyEpisodes(seasonId);
    return NextResponse.json(episodes, { status: 200 });
  } catch (e) {
    console.error('Failed to get episodes', e);
    return NextResponse.json({ error: 'An error occurred while fetching episodes.' }, { status: 500 });
  }
}
