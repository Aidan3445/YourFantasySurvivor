import { type NextRequest, NextResponse } from 'next/server';
import getBaseEvents from '~/services/seasons/query/baseEvents';

export async function GET(req: NextRequest) {
  const seasonIdParam = req.nextUrl.searchParams.get('seasonId');
  const seasonId = seasonIdParam ? parseInt(seasonIdParam, 10) : undefined;

  if (!seasonId) {
    return NextResponse.json({ error: 'Missing or invalid seasonId parameter' }, { status: 400 });
  }

  try {
    const baseEvents = await getBaseEvents(seasonId);
    return NextResponse.json(baseEvents, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}