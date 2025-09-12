import { type NextRequest, NextResponse } from 'next/server';
import { withSystemAdminAuth } from '~/lib/apiMiddleware';
import { fetchSurvivorSeasonData } from '~/lib/sys';

export async function GET(req: NextRequest) {
  return await withSystemAdminAuth(async () => {
    const searchParams = req.nextUrl.searchParams;
    const seasonName = searchParams.get('seasonName');
    if (!seasonName) {
      return NextResponse.json({ error: 'Missing seasonName parameter' }, { status: 400 });
    }

    try {
      const castaways = await fetchSurvivorSeasonData(seasonName);
      return NextResponse.json(castaways);
    } catch (error) {
      console.error('Error fetching castaways', error);
      return NextResponse.json({ error: 'Error fetching castaways' }, { status: 500 });
    }
  })();
}
