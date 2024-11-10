import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { getNextPremierDate } from '~/app/api/seasons/query';
import { db } from '~/server/db';
import { leagueSettings } from '~/server/db/schema/leagues';

export async function newLeagueSettings(leagueId: number): Promise<void> {
  const user = await auth();
  if (!user.userId) throw new Error('User not authenticated');

  // get premier date and set default to 1 week before
  const draftDate = await getNextPremierDate().then((date) => {
    date.setDate(date.getDate() - 7);
    return date.toISOString();
  });

  await db
    .insert(leagueSettings)
    .values({ league: leagueId, draftDate: draftDate });
}
