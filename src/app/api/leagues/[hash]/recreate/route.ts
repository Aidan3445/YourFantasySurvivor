import { type NextRequest, NextResponse } from 'next/server';
import { withLeagueOwnerAuth } from '~/lib/apiMiddleware';
import recreateLeagueLogic from '~/services/leagues/mutation/recreateLeague';
import { type LeagueRouteParams } from '~/types/api';

export async function POST(request: NextRequest, context: LeagueRouteParams) {
  return withLeagueOwnerAuth(async (auth) => {
    try {
      const body = await request.json() as {
        leagueHash: string;
        memberIds: number[];
      };

      const { newHash } = await recreateLeagueLogic(
        auth,
        body.memberIds
      );

      return NextResponse.json({ newHash }, { status: 201 });
    } catch (error) {
      console.error('Failed to create new league', error);
      return NextResponse.json({ error: 'An error occurred while creating the league.' }, { status: 500 });
    }
  })(context);
}
