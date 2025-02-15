import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { type LeaguePageProps } from '~/app/leagues/[leagueHash]/layout';
import { db } from '~/server/db';
import { leaguesSchema } from '~/server/db/schema/leagues';

export async function GET(_: NextRequest, { params }: LeaguePageProps) {
  const { leagueHash } = await params;
  try {
    const league = await db
      .select({ leagueStatus: leaguesSchema.leagueStatus })
      .from(leaguesSchema)
      .where(eq(leaguesSchema.leagueHash, leagueHash))
      .then((leagues) => leagues[0]);

    return NextResponse.json({ leagueStatus: league?.leagueStatus }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

