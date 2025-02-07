import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { leagueSettingsSchema, leaguesSchema } from '~/server/db/schema/leagues';
import { leagueMembersSchema } from '~/server/db/schema/leagueMembers';
import { seasons } from '~/server/db/schema/seasons';
import { auth } from '@clerk/nextjs/server';
import { leagueMemberAuth } from '~/lib/auth';

export const QUERIES = {
  /**
   * Get a league by its hash
   * @param leagueHash - the hash of the league
   * @param membersOnly - if true, authentication only allows members
   * the league will not be returned if the user is not a member
   * @returns the league or undefined if it does not exist
   * @throws an error if the user is not authenticated
   */
  getLeague: async function(leagueHash: string, membersOnly = true) {
    const { userId, memberId } = membersOnly ?
      await leagueMemberAuth(leagueHash) :
      { ...(await auth()), memberId: null };
    // If the user is not authenticated, throw an error
    if (!userId) {
      throw new Error('User not authenticated');
    }
    // If the user is not a member of the league and membersOnly is true
    // return undefined
    if (membersOnly && !memberId) {
      return undefined;
    }

    const leaguePromise = db
      .select({
        leagueId: leaguesSchema.leagueId,
        leagueName: leaguesSchema.leagueName,
        leagueHash: leaguesSchema.leagueHash,
        season: seasons.seasonName,
        settings: leagueSettingsSchema,
      })
      .from(leaguesSchema)
      .innerJoin(leagueSettingsSchema, eq(leagueSettingsSchema.leagueId, leaguesSchema.leagueId))
      .innerJoin(seasons, eq(seasons.seasonId, leaguesSchema.leagueSeason))
      .where(eq(leaguesSchema.leagueHash, leagueHash));

    const membersPromise = db
      .select({
        memberId: leagueMembersSchema.memberId,
        color: leagueMembersSchema.color,
        displayName: leagueMembersSchema.displayName,
        role: leagueMembersSchema.role,
      })
      .from(leagueMembersSchema)
      .innerJoin(leaguesSchema, eq(leaguesSchema.leagueId, leagueMembersSchema.leagueId))
      .where(eq(leaguesSchema.leagueHash, leagueHash));

    const [league, membersList] = await Promise.all([leaguePromise, membersPromise]);

    if (!league[0]) {
      return undefined;
    }

    const members = {
      loggedIn: membersList.find((member) => member.memberId === memberId),
      list: membersList,
    };

    return { ...league[0], members };
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
