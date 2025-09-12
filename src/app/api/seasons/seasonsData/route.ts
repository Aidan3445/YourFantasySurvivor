import { type NextRequest, NextResponse } from 'next/server';
import getSeasonsData from '~/services/seasons/query/seasonsData';

export async function GET(req: NextRequest) {
  const includeInactiveParam = req.nextUrl.searchParams.get('includeInactive');
  const includeInactive = includeInactiveParam === 'true';

  try {
    const seasonsData = await getSeasonsData(includeInactive);
    return NextResponse.json({ seasonsData }, { status: 200 });
  } catch (e) {
    console.error('Failed to get seasons data', e);
    return NextResponse.json({ error: 'An error occurred while fetching seasons data.' }, { status: 500 });
  }
}
