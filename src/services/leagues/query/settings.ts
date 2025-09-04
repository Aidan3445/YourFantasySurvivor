import 'server-only';

import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import { leagueSettingsSchema } from '~/server/db/schema/leagues';
import { type LeagueSettings } from '~/types/leagues';
import { type VerifiedLeagueMemberAuth } from '~/types/api';

/**
   * Get a league settings by its hash
   * @param auth The authenticated league member
   * @returns the league settings
   * @throws an error if the user is not authenticated
   * @returnObj `LeagueSettings | undefined`
   */
export default async function getLeague(auth: VerifiedLeagueMemberAuth) {
  return db
    .select({
      leagueId: leagueSettingsSchema.leagueId,
      draftDate: leagueSettingsSchema.draftDate,
      survivalCap: leagueSettingsSchema.survivalCap,
      preserveStreak: leagueSettingsSchema.preserveStreak
    })
    .from(leagueSettingsSchema)
    .where(eq(leagueSettingsSchema.leagueId, auth.leagueId))
    .then((leagues) => ({
      ...leagues[0],
      draftDate: leagues[0]?.draftDate ? new Date(`${leagues[0]?.draftDate} Z`) : null
    } as LeagueSettings));
}
