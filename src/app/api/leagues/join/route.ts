import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '~/lib/auth';
import joinLeagueLogic from '~/services/leagues/mutation/joinLeague';
import { type NewLeagueMember } from '~/types/leagueMembers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      leagueHash: string;
      newMember: NewLeagueMember;
    };

    const result = await requireAuth(joinLeagueLogic)(
      body.leagueHash,
      body.newMember
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    let message: string;
    if (error instanceof Error) message = error.message;
    else message = String(error);

    if (message === 'User not authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
