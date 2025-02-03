import { NextResponse } from 'next/server';
import { getLatestSeason } from '../query';

export async function GET() {
  const latestSeason = await getLatestSeason();

  return NextResponse.json<number>(latestSeason, { status: 200 });
}
