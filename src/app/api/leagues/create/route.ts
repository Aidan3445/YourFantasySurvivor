import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '~/lib/auth';
import createNewLeagueLogic from '~/services/leagues/mutation/createNewLeague';
import { type LeagueName } from '~/types/deprecated/leagues';
import { type NewLeagueMember } from '~/types/deprecated/leagueMembers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      leagueName: LeagueName;
      newMember: NewLeagueMember;
      draftDate?: Date;
    };

    const { newLeagueHash } = await requireAuth(createNewLeagueLogic)(
      body.leagueName,
      body.newMember,
      body.draftDate
    );

    return NextResponse.json({ newLeagueHash }, { status: 200 });
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
