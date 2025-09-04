import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '~/lib/auth';
import joinLeagueLogic from '~/services/leagues/mutation/joinLeague';
import { type LeagueMemberInsert } from '~/types/leagueMembers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      leagueHash: string;
      newMember: LeagueMemberInsert;
    };

    const result = await requireAuth(joinLeagueLogic)(
      body.leagueHash,
      body.newMember
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to join league', error);
    return NextResponse.json({ error: 'An error occurred while joining the league.' }, { status: 500 });
  }
}
