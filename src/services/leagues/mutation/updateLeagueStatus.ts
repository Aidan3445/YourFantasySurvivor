import 'server-only';
import { db } from '~/server/db';
import { and, eq, isNotNull } from 'drizzle-orm';
import { leagueSchema, leagueSettingsSchema } from '~/server/db/schema/leagues';
import { leagueMemberSchema } from '~/server/db/schema/leagueMembers';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import { type LeagueStatus } from '~/types/leagues';
import getKeyEpisodes from '~/services/seasons/query/getKeyEpisodes';
import { sendPushToUsers } from '~/services/notifications/push';

/**
  * Update the league status to the next stage
  * Predraft -> Draft -> Active -> Inactive
  * @param auth The authenticated league member
  * @returns Success status of the update
  * @returnObj `{ success }`
  */
export default async function updateLeagueStatusLogic(
  auth: VerifiedLeagueMemberAuth,
) {
  if (auth.status === 'Inactive') throw new Error('League is inactive');

  // Transaction to update the league settings
  const result = await db.transaction(async (trx) => {
    const league = await trx
      .select({ status: leagueSchema.status, name: leagueSchema.name, hash: leagueSchema.hash })
      .from(leagueSchema)
      .where(eq(leagueSchema.leagueId, auth.leagueId))
      .then((res) => res[0]);

    if (!league) {
      throw new Error('League not found');
    }

    let newStatus: LeagueStatus;
    let keyEpisodes;
    switch (league.status) {
      case 'Predraft':
        newStatus = 'Draft';
        break;
      case 'Draft':
        newStatus = 'Active';
        keyEpisodes = await getKeyEpisodes(auth.leagueId);
        break;
      case 'Active':
        newStatus = 'Inactive';
        break;
      case 'Inactive':
        throw new Error('League is already inactive');
      default:
        throw new Error('Invalid league status');
    }

    const update = await trx
      .update(leagueSchema)
      .set({ status: newStatus, startWeek: keyEpisodes?.nextEpisode?.episodeNumber ?? null })
      .where(eq(leagueSchema.leagueId, auth.leagueId))
      .returning({ status: leagueSchema.status })
      .then((res) => res[0]);

    if (!update) {
      throw new Error('Failed to update league status');
    }

    if (update.status === 'Draft') {
      const draftDateUpdate = await trx
        .update(leagueSettingsSchema)
        .set({ draftDate: new Date().toISOString() })
        .where(eq(leagueSettingsSchema.leagueId, auth.leagueId))
        .returning({ draftDate: leagueSettingsSchema.draftDate })
        .then((res) => res[0]);

      if (!draftDateUpdate) {
        throw new Error('Failed to set draft date');
      }

      // Get all admitted member userIds for notification
      const members = await trx
        .select({ userId: leagueMemberSchema.userId })
        .from(leagueMemberSchema)
        .where(and(
          eq(leagueMemberSchema.leagueId, auth.leagueId),
          isNotNull(leagueMemberSchema.draftOrder)));

      return {
        success: true,
        notifyDraft: true,
        userIds: members.map((m) => m.userId),
        leagueName: league.name,
        leagueHash: league.hash,
      };
    }

    return { success: true, notifyDraft: false };
  });

  // Send notification outside transaction
  if (result.notifyDraft && result.userIds && result.userIds.length > 0) {
    void sendPushToUsers(
      result.userIds,
      {
        title: 'Draft Starting',
        body: `The draft for ${result.leagueName} is starting now!`,
        data: { type: 'draft_start', leagueHash: result.leagueHash },
      },
      'leagueActivity'
    );
  }

  return { success: true };
}
