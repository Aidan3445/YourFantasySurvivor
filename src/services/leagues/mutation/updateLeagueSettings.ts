import 'server-only';

import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import { leagueSchema, leagueSettingsSchema } from '~/server/db/schema/leagues';
import { type VerifiedLeagueMemberAuth } from '~/types/api';
import { type LeagueSettingsUpdate } from '~/types/leagues';
import updateAdminsLogic from '~/services/leagues/mutation/updateAdmins';

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
  update: LeagueSettingsUpdate
) {
  if (auth.status === 'Inactive') throw new Error('League is inactive');

  const { name, draftDate, admins } = update;

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
  return await db.transaction(async (trx) => {
    await trx
      .update(leagueSettingsSchema)
      // we need the date === null because we want to allow setting it to null
      .set({ ...update, draftDate: safeDraftDate === null ? null : safeDraftDate?.toUTCString() })
      .from(leagueSchema)
      .where(eq(leagueSettingsSchema.leagueId, auth.leagueId));

    if (name) {
      await trx
        .update(leagueSchema)
        .set({ name })
        .where(eq(leagueSchema.leagueId, auth.leagueId))
        .returning({ name: leagueSchema.name })
        .then((res) => res[0]);
    }

    if (admins) {
      await updateAdminsLogic(auth, admins);
    }

    return { success: true };
  });
}
