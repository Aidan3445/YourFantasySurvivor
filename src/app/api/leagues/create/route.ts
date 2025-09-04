import { type NextRequest, NextResponse } from 'next/server';
import { withAuth } from '~/lib/apiMiddleware';
import createNewLeagueLogic from '~/services/leagues/mutation/createNewLeague';
import { type LeagueMemberInsert } from '~/types/leagueMembers';

export async function POST(request: NextRequest) {
  return await withAuth(async (userId) => {
    const body = await request.json() as {
      leagueName: string;
      newMember: LeagueMemberInsert;
      draftDate?: Date;
    };

    try {
      const { newLeagueHash } = await createNewLeagueLogic(
        userId,
        body.leagueName,
        body.newMember,
        body.draftDate
      );

      return NextResponse.json({ newLeagueHash }, { status: 201 });
    } catch (error) {
      console.error('Failed to create new league', error);
      return NextResponse.json({ error: 'An error occurred while creating the league.' }, { status: 500 });
    }
  })();
}
