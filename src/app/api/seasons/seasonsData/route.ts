import { type NextRequest, NextResponse } from 'next/server';
import getSeasonsData, { getSeasonData } from '~/services/seasons/query/seasonsData';

export async function GET(req: NextRequest) {
  const includeInactiveParam = req.nextUrl.searchParams.get('includeInactive');
  const includeInactive = includeInactiveParam === 'true';
  const seasonIdParam = req.nextUrl.searchParams.get('seasonId');
  const seasonId = seasonIdParam ? parseInt(seasonIdParam, 10) : undefined;

  try {
    if (seasonId) {
      const seasonsData = [await getSeasonData(seasonId)];
      return NextResponse.json({ seasonsData }, { status: 200 });
    }
    const seasonsData = await getSeasonsData(includeInactive);
    return NextResponse.json({ seasonsData }, { status: 200 });
  } catch (e) {
    console.error('Failed to get seasons data', e);
    return NextResponse.json({ error: 'An error occurred while fetching seasons data.' }, { status: 500 });
  }
}
