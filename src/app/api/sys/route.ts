import { type NextRequest, NextResponse } from 'next/server';
import { withSystemAdminAuth } from '~/lib/apiMiddleware';
import getExternalData from '~/services/seasons/query/externalData';
import { resetServersideCache } from '~/services/seasons/reset';

export async function GET(req: NextRequest) {
  return await withSystemAdminAuth(async () => {
    const searchParams = req.nextUrl.searchParams;
    const seasonName = searchParams.get('seasonName');
    if (!seasonName) {
      return NextResponse.json({ error: 'Missing seasonName parameter' }, { status: 400 });
    }

    try {
      const castaways = await getExternalData(seasonName.trim());
      return NextResponse.json(castaways);
    } catch (error) {
      console.error('Error fetching castaways', error);
      return NextResponse.json({ error: 'Error fetching castaways' }, { status: 500 });
    }
  })();
}

export async function POST() {
  return await withSystemAdminAuth(async () => {
    try {
      const success = await resetServersideCache();
      if (success) {
        return NextResponse.json({ message: 'Cache reset successfully' });
      } else {
        return NextResponse.json({ error: 'Failed to reset cache' }, { status: 500 });
      }
    } catch (error) {
      console.error('Error resetting cache', error);
      return NextResponse.json({ error: 'Error resetting cache' }, { status: 500 });
    }
  })();
}
