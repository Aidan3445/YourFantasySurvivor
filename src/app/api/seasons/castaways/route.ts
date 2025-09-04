import { type NextRequest, NextResponse } from 'next/server';
import getCastaways from '~/services/seasons/query/castaways';

export async function GET(req: NextRequest) {
  const seasonIdParam = req.nextUrl.searchParams.get('seasonId');
  const seasonId = seasonIdParam ? parseInt(seasonIdParam, 10) : undefined;

  if (!seasonId) {
    return NextResponse.json({ error: 'Missing or invalid seasonId parameter' }, { status: 400 });
  }

  try {
    const castaways = await getCastaways(seasonId);
    return NextResponse.json({ castaways }, { status: 200 });
  } catch (e) {
    console.error('Failed to get castaways', e);
    return NextResponse.json({ error: 'An error occurred while fetching castaways.' }, { status: 500 });
  }
}
