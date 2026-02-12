import 'server-only';
import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import { leagueSchema, leagueSettingsSchema } from '~/server/db/schema/leagues';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import { type LeagueSettingsUpdate } from '~/types/leagues';
import { scheduleDraftDateNotification } from '~/lib/qStash';

/**
 * Update the league settings
 * @param auth The authenticated league member
 * @param update The settings to update
 * @throws an error if the draft timing cannot be updated
 * @returns Success status of the update
 * @returnObj `{ success }`
 */
export default async function updateLeagueSettingsLogic(
  auth: VerifiedLeagueMemberAuth,
  update: LeagueSettingsUpdate,
) {
  if (auth.status === 'Inactive') throw new Error('League is inactive');
  if (auth.role === 'Member') throw new Error('Not authorized to update league settings');

  const { name, draftDate } = update;

  let safeDraftDate: Date | null | undefined = undefined;
  // draft date may come in as string
  if (draftDate && typeof draftDate === 'string') {
    const parsedDate = new Date(draftDate);
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid draft date');
    }
    safeDraftDate = parsedDate;
  } else if (draftDate instanceof Date || draftDate === null) {
    safeDraftDate = draftDate;
  } else if (draftDate !== undefined) {
    throw new Error('Invalid draft date');
  }

  // Transaction to update the league settings
  const result = await db.transaction(async (trx) => {
    const { secondaryPickMultiplier, ...rest } = update;

    await trx
      .update(leagueSettingsSchema)
      .set({
        ...rest,
        secondaryPickMultiplier: secondaryPickMultiplier
          ? secondaryPickMultiplier * 100
          : undefined,
        draftDate: safeDraftDate === null
          ? null
          : safeDraftDate?.toUTCString(),
      })
      .from(leagueSchema)
      .where(eq(leagueSettingsSchema.leagueId, auth.leagueId));

    let leagueName: string | undefined;
    if (name) {
      leagueName = await trx
        .update(leagueSchema)
        .set({ name: name.trim() })
        .where(eq(leagueSchema.leagueId, auth.leagueId))
        .returning({ name: leagueSchema.name })
        .then((res) => res[0]?.name);
    }

    // Get league info for notification if draft date changed
    if (safeDraftDate !== undefined) {
      const league = await trx
        .select({ name: leagueSchema.name, hash: leagueSchema.hash })
        .from(leagueSchema)
        .where(eq(leagueSchema.leagueId, auth.leagueId))
        .then((res) => res[0]);

      return {
        success: true,
        draftChanged: true,
        leagueName: leagueName ?? league?.name ?? '',
        leagueHash: league?.hash ?? '',
      };
    }

    return { success: true, draftChanged: false };
  });

  // Schedule draft date notification outside transaction
  if (result.draftChanged) {
    void scheduleDraftDateNotification({
      leagueId: auth.leagueId,
      leagueHash: result.leagueHash!,
      leagueName: result.leagueName!,
      draftDate: safeDraftDate ? safeDraftDate.toISOString() : null,
    });
  }

  return result;
}
