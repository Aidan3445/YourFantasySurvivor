import { type NextRequest, NextResponse } from 'next/server';
import getCurrentSeasons from '~/services/seasons/query/currentSeasons';
import getAllSeasons from '~/services/seasons/query/allSeasons';

export async function GET(req: NextRequest) {
  const includeInactiveParam = req.nextUrl.searchParams.get('includeInactive');
  const includeInactive = includeInactiveParam === 'true';

  try {
    const seasons = includeInactive ? await getAllSeasons() : await getCurrentSeasons();
    return NextResponse.json({ seasons }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
