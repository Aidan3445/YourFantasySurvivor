import 'server-only';

import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import { leagueSchema, leagueSettingsSchema } from '~/server/db/schema/leagues';
import { type LeagueSettings } from '~/types/leagues';

/**
   * Get a league settings by its hash
   * @param hash The hash of the league
   * @returns the league settings
   * @throws an error if the user is not authenticated
   * @returnObj `LeagueSettings | undefined`
   */
export default async function getLeague(hash: string) {
  return db
    .select({
      leagueId: leagueSettingsSchema.leagueId,
      draftDate: leagueSettingsSchema.draftDate,
      survivalCap: leagueSettingsSchema.survivalCap,
      preserveStreak: leagueSettingsSchema.preserveStreak
    })
    .from(leagueSettingsSchema)
    .innerJoin(leagueSchema, eq(leagueSettingsSchema.leagueId, leagueSchema.leagueId))
    .where(eq(leagueSchema.hash, hash))
    .then((leagues) => ({
      ...leagues[0],
      draftDate: leagues[0]?.draftDate ? new Date(`${leagues[0]?.draftDate} Z`) : null
    } as LeagueSettings));
}
