'use server';
import { db } from '~/server/db';
import { eq, and, notInArray } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { baseEventRules } from '~/server/db/schema/leagues';
import { type RulesType } from '~/server/db/schema/rules';
import { customEventRules } from '~/server/db/schema/customEvents';
import { weeklyEventRules } from '~/server/db/schema/weeklyEvents';
import { seasonEventRules } from '~/server/db/schema/seasonEvents';

export async function updateRules(leagueId: number, rules: RulesType) {
  const user = auth();
  if (!user.userId) throw new Error('User not authenticated');

  // base rules
  const base = await db
    .update(baseEventRules)
    .set({ ...rules })
    .where(eq(baseEventRules.league, leagueId))
    .returning();

  // custom rules
  const allCustom = rules.custom.map((custom) => {
    if (custom.id) return db
      .update(customEventRules)
      .set({ ...custom })
      .where(
        and(
          eq(customEventRules.league, leagueId),
          eq(customEventRules.id, custom.id)
        ),
      )
      .returning();
    else return db
      .insert(customEventRules)
      .values({ ...custom, league: leagueId })
      .returning();
  });
  const custom = (await Promise.all(allCustom)).flat();

  // weekly rules
  const allWeekly = rules.weekly.map((weekly) => {
    if (weekly.id) return db
      .update(weeklyEventRules)
      .set({ ...weekly })
      .where(
        and(
          eq(weeklyEventRules.league, leagueId),
          eq(weeklyEventRules.id, weekly.id)
        ),
      )
      .returning();
    else return db
      .insert(weeklyEventRules)
      .values({ ...weekly, league: leagueId })
      .returning();
  });
  const weekly = (await Promise.all(allWeekly)).flat();

  // season rules
  const allSeason = rules.season.map((season) => {
    if (season.id) return db
      .update(seasonEventRules)
      .set({ ...season, league: leagueId })
      .where(
        and(
          eq(seasonEventRules.league, leagueId),
          eq(seasonEventRules.id, season.id)
        ),
      )
      .returning();
    else return db
      .insert(seasonEventRules)
      .values({ ...season, league: leagueId })
      .returning();
  });
  const season = (await Promise.all(allSeason)).flat();

  // delete any removed rules
  const customIds = custom.map((c) => c.id);
  const deleteCustom = db
    .delete(customEventRules)
    .where(
      and(
        eq(customEventRules.league, leagueId),
        notInArray(customEventRules.id, customIds)));
  const weeklyIds = weekly.map((w) => w.id);
  const deleteWeekly = db
    .delete(weeklyEventRules)
    .where(
      and(
        eq(weeklyEventRules.league, leagueId),
        notInArray(weeklyEventRules.id, weeklyIds)));
  const seasonIds = season.map((s) => s.id);
  const deleteSeason = db
    .delete(seasonEventRules)
    .where(
      and(
        eq(seasonEventRules.league, leagueId),
        notInArray(seasonEventRules.id, seasonIds)));

  await Promise.all([deleteCustom, deleteWeekly, deleteSeason]);

  return {
    ...base[0]!,
    custom: custom ?? rules.custom,
    weekly: weekly ?? rules.weekly,
    season: season ?? rules.season,
  };
}
