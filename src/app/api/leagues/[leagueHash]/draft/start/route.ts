import { NextResponse, type NextRequest } from 'next/server';
import { type LeaguePageProps } from '~/app/leagues/[leagueHash]/layout';
import { UPDATES } from '~/app/api/leagues/update';

export async function POST(_: NextRequest, { params }: LeaguePageProps) {
  const { leagueHash } = await params;
  try {
    await UPDATES.updateLeagueStatus(leagueHash, 'Draft');
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
  return NextResponse.json({ leagueStatus: 'Draft' }, { status: 200 });
}
