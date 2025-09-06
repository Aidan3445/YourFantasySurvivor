import { type NextRequest, NextResponse } from 'next/server';
import getTribeMembers from '~/services/seasons/query/tribeMembers';

export async function GET(req: NextRequest) {
  const seasonIdParam = req.nextUrl.searchParams.get('seasonId');
  const seasonId = seasonIdParam ? parseInt(seasonIdParam, 10) : undefined;
  const episodeParam = req.nextUrl.searchParams.get('episodeNumber');
  const episodeNumber = episodeParam ? parseInt(episodeParam, 10) : undefined;

  if (!seasonId) {
    return NextResponse.json({ error: 'Missing or invalid seasonId parameter' }, { status: 400 });
  }

  if (!episodeNumber) {
    return NextResponse.json({ error: 'Missing or invalid episodeNumber parameter' }, { status: 400 });
  }

  try {
    const tribeMembers = await getTribeMembers(seasonId, episodeNumber);
    return NextResponse.json(tribeMembers, { status: 200 });
  } catch (e) {
    console.error('Failed to get tribes timeline', e);
    return NextResponse.json({ error: 'An error occurred while fetching tribes timeline.' }, { status: 500 });
  }
}
