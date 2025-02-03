import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { getCastawayEvents, getTribeEvents, getTribeUpdates } from './query';

export async function GET(req: NextRequest, props: { params: Promise<{ name: string }> }) {
  const params = await props.params;
  const seasonName = params.name;
  const searchParams = req.nextUrl.searchParams;
  const castawayName = searchParams.get('castaway');
  const tribeName = searchParams.get('tribe');

  const castawayEventsData = getCastawayEvents(seasonName, castawayName);
  const tribeEventsData = getTribeEvents(seasonName, tribeName);
  const tribeUpdatesData = getTribeUpdates(seasonName);

  const [castawayEvents, tribeEvents, tribeUpdates] = await Promise.all([castawayEventsData, tribeEventsData, tribeUpdatesData]);
  return NextResponse.json({ castawayEvents, tribeEvents, tribeUpdates });
}
