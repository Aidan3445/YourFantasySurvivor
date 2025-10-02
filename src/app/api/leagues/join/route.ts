import { type NextRequest, NextResponse } from 'next/server';
import { withAuth } from '~/lib/apiMiddleware';
import joinLeagueLogic from '~/services/leagues/mutation/joinLeague';
import getPublicLeague from '~/services/leagues/query/public';
import { type LeagueMemberInsert } from '~/types/leagueMembers';

export async function GET(request: NextRequest) {
  return await withAuth(async () => {
    const hashParam = request.nextUrl.searchParams.get('hash');
    const hash = hashParam ? hashParam : undefined;

    if (!hash) {
      return NextResponse.json({ error: 'Missing or invalid hash parameter' }, { status: 400 });
    }

    try {
      const publicLeagueData = await getPublicLeague(hash);
      if (!publicLeagueData) {
        return NextResponse.json({ error: 'League not found' }, { status: 404 });
      }

      return NextResponse.json(publicLeagueData, { status: 200 });
    } catch (e) {
      console.error('Failed to get public league data', e);
      return NextResponse.json({ error: 'An error occurred while fetching league data.' }, { status: 500 });
    }
  })();

}

export async function POST(request: NextRequest) {
  return await withAuth(async (userId) => {
    try {
      const body = await request.json() as {
        hash: string;
        newMember: LeagueMemberInsert;
      };

      const success = await joinLeagueLogic(userId, body.hash, body.newMember);

      return NextResponse.json(success, { status: 201 });
    } catch (error) {
      console.error('Failed to join league', error);
      return NextResponse.json({ error: 'An error occurred while joining the league.' }, { status: 500 });
    }
  })();
}

