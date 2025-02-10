import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { leagueSettingsSchema, leaguesSchema } from '~/server/db/schema/leagues';
import { leagueMembersSchema } from '~/server/db/schema/leagueMembers';
import { seasonsSchema } from '~/server/db/schema/seasons';
import { leagueMemberAuth } from '~/lib/auth';
import { baseEventRulesSchema } from '~/server/db/schema/baseEvents';

export const QUERIES = {
  /**
   * Get a league by its hash
   * @param leagueHash - the hash of the league
   * @param membersOnly - if true, authentication only allows members
   * the league will not be returned if the user is not a member
   * @returns the league or undefined if it does not exist
   * @throws an error if the user is not authenticated
   */
  getLeague: async function(leagueHash: string) {
    const { userId, memberId } = await leagueMemberAuth(leagueHash);
    // If the user is not authenticated, throw an error
    if (!userId) {
      throw new Error('User not authenticated');
    }
    // If the user is not a member of the league return undefined
    if (!memberId) {
      return undefined;
    }

    const leaguePromise = db
      .select({
        leagueId: leaguesSchema.leagueId,
        leagueName: leaguesSchema.leagueName,
        leagueHash: leaguesSchema.leagueHash,
        season: seasonsSchema.seasonName,
        settings: leagueSettingsSchema,
        baseEventRules: baseEventRulesSchema
      })
      .from(leaguesSchema)
      .innerJoin(leagueSettingsSchema, eq(leagueSettingsSchema.leagueId, leaguesSchema.leagueId))
      .innerJoin(seasonsSchema, eq(seasonsSchema.seasonId, leaguesSchema.leagueSeason))
      .innerJoin(baseEventRulesSchema, eq(baseEventRulesSchema.leagueId, leaguesSchema.leagueId))
      .where(eq(leaguesSchema.leagueHash, leagueHash))
      .then((leagues) => leagues[0]);

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

    if (!league) {
      return undefined;
    }

    const members = {
      loggedIn: membersList.find((member) => member.memberId === memberId),
      list: membersList,
    };

    return {
      ...league,
      settings: {
        ...league.settings,
        draftOver: !!(league.settings.draftDate && new Date() > new Date(league.settings.draftDate)),
      },
      members,
    };
  },

  /**
    * Get the league colors only for joining the league
    * @param leagueHash - the hash of the league
    * @returns the league or undefined if the user is already a member
    * @throws an error if the user is not authenticated
    */
  getLeagueJoin: async function(leagueHash: string) {
    const { userId, memberId } = await leagueMemberAuth(leagueHash);
    // If the user is not authenticated, throw an error
    if (!userId) {
      throw new Error('User not authenticated');
    }
    // If the user is already a member of the league return undefined
    if (memberId) {
      return undefined;
    }

    const members = {
      list: await db
        .select({ color: leagueMembersSchema.color })
        .from(leagueMembersSchema)
        .innerJoin(leaguesSchema, eq(leaguesSchema.leagueId, leagueMembersSchema.leagueId))
        .where(eq(leaguesSchema.leagueHash, leagueHash))
    };

    return { members } as unknown as ReturnType<typeof QUERIES.getLeague>;
  }
};
