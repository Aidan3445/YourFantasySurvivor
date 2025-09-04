import { type NextRequest, NextResponse } from 'next/server';
import getTribes from '~/services/seasons/query/tribes';

export async function GET(req: NextRequest) {
  const seasonIdParam = req.nextUrl.searchParams.get('seasonId');
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
