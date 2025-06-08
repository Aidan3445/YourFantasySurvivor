import { type NextRequest, NextResponse } from 'next/server';
import Ably from 'ably';
import { type LeaguePageProps } from '~/app/leagues/[leagueHash]/layout';
import { leagueMemberAuth } from '~/lib/auth';

export async function GET(_: NextRequest, { params }: LeaguePageProps) {
  const { leagueHash } = await params;
  const { userId } = await leagueMemberAuth(leagueHash);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = new Ably.Rest({ key: process.env.ABLY_CHAT_KEY });
    const tokenRequest = await client.auth.createTokenRequest({
      clientId: userId,
    });

    return NextResponse.json(tokenRequest, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
