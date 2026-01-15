'use server';

import { leagueMemberAuth } from '~/lib/auth';
import { db } from '~/server/db';
import { eq } from 'drizzle-orm';
import { leagueSettingsSchema } from '~/server/db/schema/leagues';
import { type SecondaryPickSettings } from '~/types/leagues';

export default async function updateSecondaryPickSettings(
  leagueHash: string,
  settings: SecondaryPickSettings
) {
  const auth = await leagueMemberAuth(leagueHash);

  if (auth.role !== 'Owner') {
    throw new Error('Only league owner can update settings');
  }

  await db
    .update(leagueSettingsSchema)
    .set({
      secondaryPickEnabled: settings.enabled,
      secondaryPickCanPickOwn: settings.canPickOwnSurvivor,
      secondaryPickLockoutPeriod: settings.lockoutPeriod,
      secondaryPickPublicPicks: settings.publicPicks,
      secondaryPickMultiplier: Math.round(settings.multiplier * 100), // Convert to percentage
    })
    .where(eq(leagueSettingsSchema.leagueId, auth.leagueId));

  return { success: true };
}
