import { type NextRequest, NextResponse } from 'next/server';
import { fetchSeasonInfo } from './query';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const seasonName = searchParams.get('seasonName');
    if (!seasonName) {
      throw new Error('Missing seasonName query parameter');
    }

    const castaways = await fetchSeasonInfo(seasonName);
    return NextResponse.json(castaways);
  } catch (error) {
    console.error('Error fetching castaways', error);
    return NextResponse.json({ error: 'Error fetching castaways' }, { status: 500 });
  }
}
