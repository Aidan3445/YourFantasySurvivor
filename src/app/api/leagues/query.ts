import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { leagueSettingsSchema, leaguesSchema } from '~/server/db/schema/leagues';
import { leagueMembersSchema } from '~/server/db/schema/leagueMembers';
import { leagueMemberAuth } from '~/lib/auth';

export const QUERIES = {
  /**
   * Get a league by its hash
   * @param leagueHash - the hash of the league
   * @returns the league or undefined if the user is not a member
   * @throws an error if the league cannot be fetched
   */
  getLeague: async function(leagueHash: string) {
    const league = await db
      .select()
      .from(leaguesSchema)
      .innerJoin(leagueSettingsSchema, eq(leagueSettingsSchema.leagueId, leaguesSchema.leagueId))
      .where(eq(leaguesSchema.leagueHash, leagueHash));

    if (!league[0]) {
      throw new Error('League not found');
    }

    // Ensure user is a member of the league
    const { memberId } = await leagueMemberAuth(league[0].league.leagueId);
    if (!memberId) {
      return undefined;
    }

    return league[0];
  },

  /**
    * Get the colors that are already taken in a league
    * @param leagueId - the id of the league
    * @returns the taken colors
    * @throws an error if the league members cannot be fetched
    */
  getUsedColors: async function(leagueId: number) {
    const colors = await db
      .select({ color: leagueMembersSchema.color })
      .from(leagueMembersSchema)
      .where(eq(leagueMembersSchema.leagueId, leagueId));

    return colors.map((color) => color.color);
  }
};
