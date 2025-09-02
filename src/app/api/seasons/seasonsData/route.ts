import { type NextRequest, NextResponse } from 'next/server';
import getSeasonsData from '~/services/seasons/seasonsData';

export async function GET(req: NextRequest) {
  const activeOnlyParam = req.nextUrl.searchParams.get('activeOnly');
  const activeOnly = activeOnlyParam === 'true';

  try {
    const data = getSeasonsData(activeOnly);
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
