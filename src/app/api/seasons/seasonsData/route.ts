import { type NextRequest, NextResponse } from 'next/server';
import getSeasonsData from '~/services/seasons/query/seasonsData';

export async function GET(req: NextRequest) {
  const includeInactiveParam = req.nextUrl.searchParams.get('includeInactive');
  const includeInactive = includeInactiveParam === 'true';


  try {
    const seasonsData = getSeasonsData(includeInactive);
    return NextResponse.json({ seasonsData }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
