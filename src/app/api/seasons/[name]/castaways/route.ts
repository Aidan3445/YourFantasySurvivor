import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { getCastaways } from './query';

export async function GET(req: NextRequest, { params }: { params: { name: string } }) {
  const seasonName = params.name;
  const searchParams = req.nextUrl.searchParams;
  const castawayName = searchParams.get('castaway');

  const castawayDetails = await getCastaways(seasonName, castawayName);

  return NextResponse.json(castawayDetails);
}
